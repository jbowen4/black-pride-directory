#!/usr/bin/env python3
"""
Upload DC Black Pride .md event files to a local Strapi instance.

Usage:
    python upload_to_strapi.py --token YOUR_TOKEN [--dir ./content/events/dc-pride-2026] [--dry-run]

Options:
    --dir         Directory containing .md files        (default: ./content/events/dc-pride-2026)
    --url         Strapi base URL                       (default: http://localhost:1337)
    --token       Strapi API token (or set STRAPI_TOKEN env var)
    --collection  Strapi collection slug                (default: events)
    --dry-run     Print payloads without sending
    --skip-errors Continue on failure instead of stopping
    --delete-all  Delete all existing entries first, then upload fresh
    --no-images   Skip og:image fetching (faster upload, no image URLs)
"""

import argparse
import json
import os
import re
import sys
import time
from pathlib import Path
from html.parser import HTMLParser

import requests

# ── CONFIG ────────────────────────────────────────────────────────────────────

STRAPI_URL = "http://localhost:1337"
API_TOKEN = ""  # or set STRAPI_TOKEN env var
COLLECTION = "events"
RATE_LIMIT_DELAY = 0.1  # seconds between requests


# ── Field mapping: frontmatter key → Strapi field name ───────────────────────

FIELD_MAP = {
    "event_name": "event_name",
    "location_name": "location_name",
    "street_address": "street_address",
    "state": "state",
    "zip_code": "zipcode",
    "country": "country",
    "time_zone": "time_zone",
    "rsvp_required": "rsvp_required",
    "price": "price",
    "instagram": "instagram",
    "website": "website",
    "description": "description",
    "organizer": "organizer_string",
    "city": "city_name",
}

BOOLEAN_FIELDS = {"rsvp_required"}

SKIP_FIELDS = {
    "city_category",
    "start_date",
    "start_time",
    "end_time",
    "image",
    "categories",
}


# ── Frontmatter parser ────────────────────────────────────────────────────────


def parse_frontmatter(md_path: Path) -> dict | None:
    """
    Parse YAML-style front matter. Handles multi-line values like:
        price: 'Early Bird: $12
        Table Resy: $56'
    by collecting continuation lines until the closing quote.
    """
    text = md_path.read_text(encoding="utf-8")
    m = re.match(r"^---\s*\n(.*?)\n---\s*(\n|$)", text, re.DOTALL)
    if not m:
        return None

    lines = m.group(1).splitlines()
    data = {}
    i = 0

    while i < len(lines):
        line = lines[i].strip()
        i += 1

        if not line or line.startswith("#") or ":" not in line:
            continue

        key, _, rest = line.partition(":")
        key = key.strip()
        rest = rest.strip()

        # Multi-line value: starts with a quote that isn't closed on this line
        if rest.startswith("'") and not (len(rest) > 1 and rest.endswith("'")):
            # Collect continuation lines until we find the closing quote
            accumulated = rest[1:]  # strip opening quote
            while i < len(lines):
                next_line = lines[i]
                i += 1
                if next_line.strip().endswith("'"):
                    accumulated += "\n" + next_line.strip().rstrip("'")
                    break
                accumulated += "\n" + next_line.strip()
            data[key] = accumulated.strip()
            continue

        # Normal single-line value — strip surrounding quotes
        if (rest.startswith("'") and rest.endswith("'")) or (
            rest.startswith('"') and rest.endswith('"')
        ):
            rest = rest[1:-1]

        data[key] = rest

    return data


# ── Price parser ──────────────────────────────────────────────────────────────


def parse_price(raw: str) -> float | None:
    """
    Extract the lowest numeric price from a raw price string.

      ''                            → None  (omit field entirely)
      '0'                           → 0
      'Free 🆓'                     → 0
      'Free before 5pm w/ RSVP'    → 0
      '$29'                         → 29.0
      'GA: $20'                     → 20.0
      'Early Bird: $12\nGA: $20'    → 12.0  (lowest tier)
      '$30 before Midnight'         → 30.0
      'GA: ($23.18)'                → 23.18 (parens = price)
      'Price at Door'               → None  (omit field)
      'Tickets start at $20'        → 20.0
    """
    if not raw or not raw.strip():
        return None

    if raw.strip() == "0":
        return 0

    lower = raw.lower()
    if "free" in lower:
        return 0

    # Match $XX.XX or (XX.XX) style amounts
    amounts = re.findall(r"[\$\(]\s*(\d+(?:\.\d+)?)", raw)
    if amounts:
        return min(float(a) for a in amounts)

    # Bare number fallback
    try:
        return float(raw.strip())
    except (ValueError, TypeError):
        pass

    return None  # "Price at Door" etc — omit from payload


# ── Datetime builder ──────────────────────────────────────────────────────────


def build_iso_datetime(date_str: str, time_str: str) -> str | None:
    if not date_str or not time_str:
        return None

    d = re.match(r"(\d{1,2})/(\d{1,2})/(\d{4})", date_str.strip())
    if not d:
        return None
    month, day, year = d.group(1).zfill(2), d.group(2).zfill(2), d.group(3)

    t = re.match(r"(\d{1,2}):(\d{2})\s*(AM|PM)", time_str.strip(), re.IGNORECASE)
    if not t:
        return None
    hour, minute, period = int(t.group(1)), t.group(2), t.group(3).upper()

    if period == "PM" and hour != 12:
        hour += 12
    elif period == "AM" and hour == 12:
        hour = 0

    return f"{year}-{month}-{day}T{hour:02d}:{minute}:00"


# ── OG image fetcher ─────────────────────────────────────────────────────────

OG_FETCH_TIMEOUT = 8  # seconds per request
OG_MAX_BYTES = 65536  # 64 KB — og tags always appear in <head>
OG_REQUEST_DELAY = 0.25  # seconds between image-fetch requests (be polite)

# Browser-like UA so platforms don't immediately 404/403
OG_USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/124.0.0.0 Safari/537.36"
)


class _OGParser(HTMLParser):
    """Lightweight SAX-style parser — stops caring after </head>."""

    def __init__(self):
        super().__init__()
        self.image = None
        self._in_head = True

    def handle_starttag(self, tag, attrs):
        if not self._in_head or self.image:
            return
        if tag == "meta":
            d = dict(attrs)
            prop = d.get("property", "") or d.get("name", "")
            if prop in ("og:image", "twitter:image"):
                self.image = (d.get("content") or "").strip() or None

    def handle_endtag(self, tag):
        if tag == "head":
            self._in_head = False


def fetch_og_image(url: str) -> str | None:
    """
    Fetch only the first ~64 KB of a page and extract the og:image URL.
    Falls back to twitter:image if og:image is absent.
    Returns None on any error or if no image meta tag is found.

    Platforms known to work with a plain GET + browser UA:
      Eventbrite, Partiful, Givebutter, Dice, Eventbee, TicketFalcon,
      Streets App, Posh (partially — some events render server-side)
    """
    if not url or not url.startswith("http"):
        return None
    try:
        resp = requests.get(
            url,
            headers={"User-Agent": OG_USER_AGENT},
            timeout=OG_FETCH_TIMEOUT,
            stream=True,
        )
        if resp.status_code >= 400:
            return None

        # Stream only until we hit the byte cap
        chunk = b""
        for piece in resp.iter_content(chunk_size=4096):
            chunk += piece
            if len(chunk) >= OG_MAX_BYTES:
                break

        html = chunk.decode("utf-8", errors="ignore")
        parser = _OGParser()
        parser.feed(html)
        return parser.image

    except Exception:
        return None


# ── Payload builder ───────────────────────────────────────────────────────────


def coerce(key: str, raw: str):
    if key in BOOLEAN_FIELDS:
        return raw.lower() in ("true", "1", "yes")
    if key == "price":
        return parse_price(raw)
    return raw


def build_payload(data: dict, fetch_image: bool = True) -> dict:
    payload = {}

    start_dt = build_iso_datetime(
        data.get("start_date", ""), data.get("start_time", "")
    )
    end_dt = build_iso_datetime(data.get("start_date", ""), data.get("end_time", ""))
    if start_dt:
        payload["start_datetime"] = start_dt
    if end_dt:
        payload["end_datetime"] = end_dt

    for fm_key, strapi_key in FIELD_MAP.items():
        if fm_key in SKIP_FIELDS:
            continue
        raw = data.get(fm_key)
        if raw is None:
            continue
        value = coerce(fm_key, raw)
        if value is None:
            continue  # omit unparseable fields (e.g. "Price at Door")
        payload[strapi_key] = value

    # Try to pull an og:image from the ticket website
    if fetch_image:
        website = data.get("website", "").strip()
        if website:
            img_url = fetch_og_image(website)
            if img_url:
                payload["image_url"] = img_url
            time.sleep(OG_REQUEST_DELAY)

    return payload


# ── Strapi API helpers ────────────────────────────────────────────────────────


def make_headers(token: str) -> dict:
    return {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}",
    }


def get_all_ids(base_url: str, collection: str, headers: dict) -> list[str]:
    """
    Fetch all existing entry documentIds (handles pagination).
    Strapi v4.10+ requires documentId (a string) for DELETE/PUT, not numeric id.
    """
    doc_ids = []
    page = 1
    page_size = 100
    while True:
        resp = requests.get(
            f"{base_url}/api/{collection}",
            headers=headers,
            params={"pagination[page]": page, "pagination[pageSize]": page_size},
            timeout=10,
        )
        resp.raise_for_status()
        body = resp.json()
        items = body.get("data", [])
        for item in items:
            # Prefer documentId (Strapi v4.10+); fall back to numeric id
            doc_ids.append(item.get("documentId") or item["id"])
        meta = body.get("meta", {}).get("pagination", {})
        if page >= meta.get("pageCount", 1):
            break
        page += 1
    return doc_ids


def delete_all(base_url: str, collection: str, headers: dict):
    """Delete every entry in the collection."""
    print("Fetching existing entries to delete...")
    ids = get_all_ids(base_url, collection, headers)
    if not ids:
        print("  Nothing to delete.")
        return
    print(f"  Deleting {len(ids)} entries...", end=" ", flush=True)
    for entry_id in ids:
        resp = requests.delete(
            f"{base_url}/api/{collection}/{entry_id}",
            headers=headers,
            timeout=10,
        )
        resp.raise_for_status()
    print("done.\n")


def post_event(
    base_url: str, collection: str, payload: dict, headers: dict, dry_run: bool = False
) -> dict:
    url = f"{base_url.rstrip('/')}/api/{collection}"
    body = {"data": payload}

    if dry_run:
        print(f"    [DRY RUN] POST {url}")
        print(f"    {json.dumps(body, indent=2, ensure_ascii=False)}")
        return {"dry_run": True}

    resp = requests.post(url, headers=headers, json=body, timeout=10)
    resp.raise_for_status()
    return resp.json()


# ── Main ──────────────────────────────────────────────────────────────────────


def main():
    parser = argparse.ArgumentParser(
        description="Upload .md event files to a local Strapi instance."
    )
    parser.add_argument("--dir", default="./content/events/dc-pride-2026")
    parser.add_argument("--url", default=STRAPI_URL)
    parser.add_argument("--token", default=os.environ.get("STRAPI_TOKEN", API_TOKEN))
    parser.add_argument("--collection", default=COLLECTION)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--skip-errors", action="store_true")
    parser.add_argument(
        "--delete-all",
        action="store_true",
        help="Delete all existing entries before uploading",
    )
    parser.add_argument(
        "--no-images",
        action="store_true",
        help="Skip og:image fetching (faster, no outbound requests for images)",
    )
    args = parser.parse_args()

    if not args.dry_run and not args.token:
        print("ERROR: No API token provided. Use --token or set STRAPI_TOKEN env var.")
        sys.exit(1)

    md_dir = Path(args.dir)
    if not md_dir.is_dir():
        print(f"ERROR: Directory not found: {md_dir}")
        sys.exit(1)

    md_files = sorted(md_dir.glob("*.md"))
    if not md_files:
        print(f"No .md files found in: {md_dir}")
        sys.exit(0)

    headers = make_headers(args.token)
    mode = "DRY RUN" if args.dry_run else "LIVE"
    print(f"Strapi URL:  {args.url}")
    print(f"Collection:  {args.collection}")
    print(f"Mode:        {mode}")
    print(f"Files found: {len(md_files)}\n")

    # Connectivity check
    if not args.dry_run:
        try:
            ping = requests.get(
                f"{args.url.rstrip('/')}/api/{args.collection}?pagination[pageSize]=1",
                headers=headers,
                timeout=5,
            )
            if ping.status_code == 401:
                print("ERROR: 401 Unauthorized — check your API token.")
                sys.exit(1)
            elif ping.status_code == 404:
                print(f"ERROR: 404 — collection '{args.collection}' not found.")
                sys.exit(1)
            ping.raise_for_status()
            print(f"✅  Connected to Strapi ({args.url})\n")
        except requests.exceptions.ConnectionError:
            print(f"ERROR: Cannot connect to {args.url}. Is Strapi running?")
            sys.exit(1)

        if args.delete_all:
            delete_all(args.url, args.collection, headers)

    success = 0
    failed = []

    for i, md_path in enumerate(md_files, 1):
        print(f"[{i:>3}/{len(md_files)}] {md_path.name}", end=" ", flush=True)

        data = parse_frontmatter(md_path)
        if data is None:
            print("⚠️   skipped (no front matter)")
            continue

        payload = build_payload(data, fetch_image=not args.no_images)

        try:
            result = post_event(
                args.url, args.collection, payload, headers, args.dry_run
            )
            if args.dry_run:
                print("✅  (dry run)")
            else:
                entry_id = result.get("data", {}).get("id", "?")
                print(f"✅  id={entry_id}")
            success += 1
        except requests.exceptions.HTTPError as e:
            body = ""
            try:
                body = e.response.json()
            except Exception:
                body = e.response.text[:200]
            print(f"❌  HTTP {e.response.status_code} — {body}")
            failed.append((md_path.name, str(body)))
            if not args.skip_errors:
                print("\nStopping. Use --skip-errors to continue past failures.")
                break
        except Exception as e:
            print(f"❌  {e}")
            failed.append((md_path.name, str(e)))
            if not args.skip_errors:
                break

        if not args.dry_run:
            time.sleep(RATE_LIMIT_DELAY)

    print(f"\n{'─'*50}")
    print(f"Uploaded:  {success}/{len(md_files)}")
    if failed:
        print(f"Failed:    {len(failed)}")
        for name, reason in failed:
            print(f"  • {name}: {reason}")


if __name__ == "__main__":
    main()
