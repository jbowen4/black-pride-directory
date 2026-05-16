#!/usr/bin/env python3
"""
Fetch event images from ticket website URLs and write them into the
'image' field of each .md frontmatter file.

Per-platform strategy:
  Posh       — Next.js SPA; fetch /_next/data/{buildId}/e/{slug}.json
               (build ID extracted from HTML chunk paths)
  Eventbrite — og:image present but relative (/e/_next/image?url=...);
               resolve to absolute + decode the inner img.evbuc.com URL
  Others     — og:image / twitter:image meta tag (Partiful, Givebutter,
               Dice, Eventbee, RingCentral, etc.)

Usage:
    python fetch_images.py [--dir ./events_md] [--dry-run] [--delay 0.5]
    python fetch_images.py --debug --overwrite --limit 5
"""

import argparse
import json
import re
import sys
import time
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlparse, parse_qs

import requests

# ── Config ────────────────────────────────────────────────────────────────────

DEFAULT_DIR = "./events_md"
TIMEOUT = 10
MAX_BYTES = 100_000  # 100 KB — need full HTML for __NEXT_DATA__
DEFAULT_DELAY = 0.4

USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/124.0.0.0 Safari/537.36"
)

IMAGE_BLOCKLIST = [
    "pixel",
    "tracker",
    "favicon",
    "badge",
    "spinner",
    "placeholder",
    "1x1",
    "blank",
    "transparent",
]

DEBUG = False


def dbg(*args):
    if DEBUG:
        print("    [debug]", *args)


# ── HTTP helper ───────────────────────────────────────────────────────────────


def _get(
    url: str, as_json: bool = False, base_headers: dict | None = None
) -> tuple[int, str | dict]:
    headers = {"User-Agent": USER_AGENT}
    if as_json:
        headers["Accept"] = "application/json"
    if base_headers:
        headers.update(base_headers)

    resp = requests.get(url, headers=headers, timeout=TIMEOUT, stream=True)
    dbg(f"GET {url[:90]} → {resp.status_code}")

    if as_json:
        if resp.status_code >= 400:
            return resp.status_code, {}
        try:
            return resp.status_code, resp.json()
        except Exception:
            return resp.status_code, {}

    chunk = b""
    for piece in resp.iter_content(4096):
        chunk += piece
        if len(chunk) >= MAX_BYTES:
            break
    html = chunk.decode("utf-8", errors="ignore")
    dbg(f"  bytes_read={len(chunk)}")
    return resp.status_code, html


# ── HTML parser ───────────────────────────────────────────────────────────────


class PageParser(HTMLParser):
    """Collects og:image, twitter:image, and first <img src> from full document."""

    def __init__(self):
        super().__init__()
        self.og_image = None
        self.twitter_image = None
        self.first_img = None

    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        if tag == "meta":
            prop = d.get("property", "") or d.get("name", "")
            content = (d.get("content") or "").strip()
            if prop == "og:image" and not self.og_image and content:
                self.og_image = content
            elif (
                prop in ("twitter:image", "twitter:image:src")
                and not self.twitter_image
                and content
            ):
                self.twitter_image = content
        elif tag == "img" and not self.first_img:
            src = (d.get("src") or "").strip()
            if src.startswith("https://") and not _is_junk(src):
                self.first_img = src

    @property
    def best(self) -> str | None:
        return self.og_image or self.twitter_image or self.first_img


def _is_junk(url: str) -> bool:
    low = url.lower()
    return any(kw in low for kw in IMAGE_BLOCKLIST)


def _find_next_data(html: str) -> dict:
    """Extract and parse the __NEXT_DATA__ JSON blob embedded in Next.js pages."""
    m = re.search(
        r'<script[^>]+id=["\']__NEXT_DATA__["\'][^>]*>(.*?)</script>', html, re.DOTALL
    )
    if not m:
        return {}
    try:
        return json.loads(m.group(1))
    except Exception:
        return {}


def _find_next_build_id(html: str) -> str | None:
    """
    Extract the Next.js build ID from HTML chunk/manifest paths.
    Appears as: /_next/static/{buildId}/_buildManifest.js
    """
    m = re.search(r"/_next/static/([A-Za-z0-9_-]+)/_(?:build|ssg)Manifest", html)
    return m.group(1) if m else None


def _deep_find_image(
    obj,
    keys=(
        "image",
        "coverImage",
        "cover",
        "flyer",
        "photo",
        "thumbnail",
        "imageUrl",
        "img",
    ),
) -> str | None:
    """Recursively search a JSON object for any key that looks like an image URL."""
    if isinstance(obj, str):
        if obj.startswith("https://") and any(
            ext in obj.lower()
            for ext in (
                ".jpg",
                ".jpeg",
                ".png",
                ".webp",
                ".gif",
                "images.",
                "/image",
                "cdn",
            )
        ):
            return obj
        return None
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k.lower() in keys:
                result = _deep_find_image(v)
                if result:
                    return result
        for v in obj.values():
            result = _deep_find_image(v)
            if result:
                return result
    if isinstance(obj, list):
        for item in obj:
            result = _deep_find_image(item)
            if result:
                return result
    return None


# ── URL normalizer ────────────────────────────────────────────────────────────


def _resolve_image_url(raw: str, page_url: str) -> str | None:
    """
    Turn a raw image value from a meta tag into a clean, absolute image URL.

    Handles:
      - Already-absolute URLs (https://...)           → return as-is
      - Relative URLs (/path/...)                     → prepend origin
      - Next.js image proxy (/.../_next/image?url=…)  → decode inner URL
      - Double-encoded URLs                           → decode once or twice
    """
    if not raw:
        return None

    # Resolve relative URLs first
    if not raw.startswith("http"):
        origin = "{0.scheme}://{0.netloc}".format(urlparse(page_url))
        raw = origin + ("" if raw.startswith("/") else "/") + raw

    dbg(f"  resolving: {raw[:100]}")

    # Next.js image proxy pattern: https://example.com/.../_next/image?url=<encoded>&w=...
    if "_next/image" in raw and "url=" in raw:
        qs = parse_qs(urlparse(raw).query)
        inner = qs.get("url", [""])[0]
        if inner:
            # May be double-encoded — decode once (img.evbuc.com/https%3A%2F%2F... → real URL)
            decoded = unquote(inner)
            dbg(f"  next/image inner (decoded): {decoded[:100]}")
            # If it's still a valid image URL, use it
            if decoded.startswith("https://"):
                return decoded

    # Return the resolved absolute URL
    return raw if raw.startswith("https://") else None


# ── Platform fetchers ─────────────────────────────────────────────────────────


def _fetch_posh(url: str) -> str | None:
    """
    Posh uses Next.js 13+ App Router with React Server Components.
    The page HTML contains no __NEXT_DATA__ or /_next/data endpoint.
    Instead, event data (including image URLs) is streamed inline as RSC
    payload inside <script>self.__next_f.push(...)</script> tags.

    Rather than parsing the RSC wire format, we regex the full HTML directly
    for known Posh CDN URL patterns, which appear in:
      - The RSC payload (raw images.posh.vip/originals/{id})
      - <meta name="twitter:image"> in <body>
      - <link rel="preload" as="image" imagesrcset="..."> in <head>

    We prefer images.posh.vip/originals/{id} (unproxied original) over the
    cdn-cgi proxy URLs which add compression and resizing parameters.
    """
    status, html = _get(url)
    if status >= 400:
        dbg(f"HTTP {status}")
        return None

    # Approach 1: raw original image URL (best quality, appears in RSC payload)
    raw_matches = re.findall(r"https://images\.posh\.vip/[^\s'\"\\>]+", html)
    dbg(f"images.posh.vip matches: {raw_matches[:3]}")
    if raw_matches:
        # Deduplicate and return the first unique original URL
        seen = []
        for m in raw_matches:
            if m not in seen:
                seen.append(m)
        dbg(f"Using: {seen[0]}")
        return seen[0]

    # Approach 2: cdn-cgi proxy URL (from twitter:image or preload link)
    cdn_matches = re.findall(r"https://posh\.vip/cdn-cgi/image/[^\s'\"\\>]+", html)
    dbg(f"cdn-cgi matches: {cdn_matches[:2]}")
    if cdn_matches:
        dbg(f"Using cdn-cgi fallback: {cdn_matches[0]}")
        return cdn_matches[0]

    dbg("Posh: no image URL pattern found in HTML")
    return None


def _fetch_generic(url: str) -> str | None:
    """og:image / twitter:image strategy for SSR platforms."""
    status, html = _get(url)
    if status >= 400:
        dbg(f"HTTP {status}")
        return None

    parser = PageParser()
    parser.feed(html)
    raw = parser.best

    dbg(
        f"Parser: og={parser.og_image and parser.og_image[:60]!r} "
        f"twitter={parser.twitter_image and parser.twitter_image[:60]!r} "
        f"first_img={parser.first_img and parser.first_img[:60]!r}"
    )

    if not raw:
        return None

    resolved = _resolve_image_url(raw, url)
    dbg(f"Resolved: {resolved and resolved[:100]!r}")
    return resolved if resolved and not _is_junk(resolved) else None


# ── Dispatcher ────────────────────────────────────────────────────────────────


def fetch_image(url: str) -> tuple[str | None, str]:
    if not url or not url.startswith("http"):
        return None, "skipped"

    domain = urlparse(url).netloc.lower()
    dbg(f"domain={domain}")

    if "posh.vip" in domain:
        return _fetch_posh(url), "posh-nextjs"

    return _fetch_generic(url), "og:image"


# ── Frontmatter helpers ───────────────────────────────────────────────────────


def get_website(md_path: Path) -> str | None:
    text = md_path.read_text(encoding="utf-8")
    m = re.search(r"^website: '([^']*)'", text, re.MULTILINE)
    if m and m.group(1).startswith("http"):
        return m.group(1)
    return None


def patch_image_field(md_path: Path, image_url: str, dry_run: bool = False) -> bool:
    text = md_path.read_text(encoding="utf-8")
    fm_match = re.match(r"^(---\s*\n)(.*?)(\n---)", text, re.DOTALL)
    if not fm_match:
        return False
    fm_body = fm_match.group(2)
    new_fm = re.sub(
        r"^image: '.*?'", f"image: '{image_url}'", fm_body, flags=re.MULTILINE
    )
    if new_fm == fm_body:
        return False
    if not dry_run:
        md_path.write_text(text.replace(fm_body, new_fm, 1), encoding="utf-8")
    return True


# ── Main ─────────────────────────────────────────────────────────────────────


def main():
    global DEBUG

    parser = argparse.ArgumentParser(
        description="Fetch event cover images from ticket URLs and patch .md files."
    )
    parser.add_argument("--dir", default=DEFAULT_DIR)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--delay", type=float, default=DEFAULT_DELAY)
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Re-fetch even if image field is already set",
    )
    parser.add_argument(
        "--debug", action="store_true", help="Print detailed per-request diagnostics"
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=0,
        help="Only process first N files (useful with --debug)",
    )
    args = parser.parse_args()

    DEBUG = args.debug

    md_dir = Path(args.dir)
    if not md_dir.is_dir():
        print(f"ERROR: Directory not found: {md_dir}")
        sys.exit(1)

    md_files = sorted(md_dir.glob("*.md"))
    if args.limit:
        md_files = md_files[: args.limit]

    print(
        f"Directory: {md_dir}  |  Files: {len(md_files)}  |  "
        f"Mode: {'DRY RUN' if args.dry_run else 'LIVE'}  |  "
        f"Debug: {'ON' if DEBUG else 'OFF'}\n"
    )

    found = skipped = no_url = not_found = 0

    for i, md_path in enumerate(md_files, 1):
        prefix = f"[{i:>3}/{len(md_files)}] {md_path.name}"

        text = md_path.read_text(encoding="utf-8")
        existing = re.search(r"^image: '([^']+)'", text, re.MULTILINE)
        if existing and existing.group(1) and not args.overwrite:
            print(f"{prefix}  –  already set")
            skipped += 1
            continue

        website = get_website(md_path)
        if not website:
            print(f"{prefix}  ⚠️  no website URL")
            no_url += 1
            continue

        print(f"{prefix}")
        print(f"         🌐  {website}", flush=True)

        img_url, method = fetch_image(website)

        if img_url:
            patch_image_field(md_path, img_url, dry_run=args.dry_run)
            tag = " [DRY RUN]" if args.dry_run else ""
            print(f"         ✅  [{method}]{tag}")
            print(f"             {img_url}")
            found += 1
        else:
            print(f"         ❌  no image found")
            not_found += 1

        time.sleep(args.delay)

    print(f"\n{'─'*60}")
    print(f"Found & written: {found}")
    print(f"Already set:     {skipped}")
    print(f"No website URL:  {no_url}")
    print(f"No image found:  {not_found}")


if __name__ == "__main__":
    main()
