#!/usr/bin/env python3
"""
DC Black Pride 2026 - Event CSV/XLSX to Markdown Converter

Usage:
    python convert_to_md.py <input_file> [--output-dir <dir>]

Supports .csv and .xlsx input files.
Outputs one .md file per event row, skipping header/date/blank rows.
"""

import argparse
import os
import re
import sys
import unicodedata

import pandas as pd


# ── Constants ─────────────────────────────────────────────────────────────────

# Columns as they appear positionally in the source file
# Col 0: Event Name  |  Col 1: gender flag (♀ or blank)
# Col 2: Promoter    |  Col 3: Event Type  |  Col 4: Time
# Col 5: Price       |  Col 6: Venue Name  |  Col 7: Venue Location
# Col 8: IG/Info     |  Col 9: Tickets

COL_EVENT  = 0
COL_GENDER = 1
COL_PROMO  = 2
COL_TYPE   = 3
COL_TIME   = 4
COL_PRICE  = 5
COL_VENUE  = 6
COL_LOC    = 7
COL_IG     = 8
COL_TICKET = 9

# Patterns that mark non-data rows
HEADER_KEYWORDS = {"event name", "promoter", "event type", "time", "price",
                   "venue name", "venue location", "ig/ info", "ig/info", "tickets"}

DATE_PATTERN = re.compile(
    r"^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s*[-–]\s*",
    re.IGNORECASE
)

# Days-of-week → date string mapping for this event series (May 2026)
# The script auto-detects the current date header while parsing, so this
# table is only a fallback in case detection fails.
DAY_DATE_MAP = {
    "tuesday":   "5/19/2026",
    "wednesday": "5/20/2026",
    "thursday":  "5/21/2026",
    "friday":    "5/22/2026",
    "saturday":  "5/23/2026",
    "sunday":    "5/24/2026",
    "monday":    "5/25/2026",
}


# ── Helpers ───────────────────────────────────────────────────────────────────

def val(cell) -> str:
    """Return a clean string for a cell value, or '' if blank/NaN."""
    if cell is None:
        return ""
    s = str(cell).strip()
    return "" if s.lower() == "nan" else s


def slugify(text: str) -> str:
    """Convert event name to a safe filename."""
    text = unicodedata.normalize("NFKD", text)
    text = text.encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[^\w\s-]", "", text).strip().lower()
    text = re.sub(r"[\s_-]+", "_", text)
    return text[:80]  # cap filename length


def is_header_row(row) -> bool:
    """True if row looks like a column-header row."""
    cells = {val(row[c]).lower() for c in range(len(row))}
    return bool(cells & HEADER_KEYWORDS)


def is_date_row(row) -> bool:
    """True if the first cell looks like a day-of-week date banner."""
    return bool(DATE_PATTERN.match(val(row[COL_EVENT])))


def is_blank_row(row) -> bool:
    """True if every cell is empty."""
    return all(val(row[c]) == "" for c in range(len(row)))


def parse_date_from_banner(banner: str):
    """
    Extract 'M/D/YYYY' from banners like 'Saturday - May 23, 2026'.
    Falls back to the DAY_DATE_MAP if regex fails.
    """
    # Try to extract month, day, year
    m = re.search(
        r"(january|february|march|april|may|june|july|august|september|"
        r"october|november|december)\s+(\d{1,2}),?\s*(\d{4})",
        banner,
        re.IGNORECASE
    )
    if m:
        months = {
            "january": 1, "february": 2, "march": 3, "april": 4,
            "may": 5, "june": 6, "july": 7, "august": 8,
            "september": 9, "october": 10, "november": 11, "december": 12
        }
        mon = months[m.group(1).lower()]
        day = int(m.group(2))
        year = int(m.group(3))
        return f"{mon}/{day}/{year}"

    # Fallback: infer from day name
    day_match = DATE_PATTERN.match(banner)
    if day_match:
        day_name = day_match.group(1).lower()
        return DAY_DATE_MAP.get(day_name, "")
    return ""


def parse_time(time_str: str):
    """
    Split a time range like '6pm - 10pm' into (start_time, end_time).
    Handles cases with only a start time or no time at all.
    """
    if not time_str:
        return "", ""

    # Normalize em-dash / en-dash
    time_str = time_str.replace("–", "-").replace("—", "-")

    # Multi-line time strings (take first line only)
    first_line = time_str.split("\n")[0].strip()

    parts = re.split(r"\s*-\s*", first_line, maxsplit=1)
    start = parts[0].strip() if parts else ""
    end   = parts[1].strip() if len(parts) > 1 else ""

    def fmt(t: str) -> str:
        """Convert '6pm' → '6:00 PM', '10:30pm' → '10:30 PM', etc."""
        t = t.strip()
        if not t:
            return ""
        m = re.match(r"(\d{1,2})(?::(\d{2}))?\s*(am|pm)", t, re.IGNORECASE)
        if m:
            hour   = int(m.group(1))
            minute = m.group(2) or "00"
            period = m.group(3).upper()
            return f"{hour}:{minute} {period}"
        return t  # return as-is if pattern doesn't match

    return fmt(start), fmt(end)


def parse_price(price_str: str):
    """
    Return (price_display, is_free) where price_display is the raw string
    and is_free is True when the event is free.
    """
    if not price_str:
        return "", False
    lower = price_str.lower()
    is_free = ("free" in lower and "before" not in lower) or price_str.strip() == "0"
    return price_str, is_free


def parse_address(location_str: str):
    """
    Try to split 'Street Address, City, State ZIP' or similar into components.
    The source data is inconsistent so this is best-effort.
    Returns (street, city, state, zip_code).
    Defaults to Washington DC when city/state are absent.
    """
    if not location_str:
        return "", "Washington", "DC", ""

    # Normalize newlines → commas
    location_str = location_str.replace("\n", ", ")

    # Remove trailing/leading whitespace
    parts = [p.strip() for p in location_str.split(",")]

    # Heuristics:
    # - If last part looks like 'MD 20743' or 'DC' we can pull state/zip
    # - Otherwise assume Washington DC

    street = parts[0] if parts else ""
    city   = "Washington"
    state  = "DC"
    zip_code = ""

    if len(parts) >= 2:
        # Check if second-to-last or last part contains state/zip info
        last = parts[-1]
        state_zip = re.match(r"([A-Z]{2})\s*(\d{5})?", last)
        if state_zip:
            state    = state_zip.group(1)
            zip_code = state_zip.group(2) or ""
            # Everything between street and state/zip is city
            if len(parts) >= 3:
                city = ", ".join(parts[1:-1])
            # else city stays Washington
        else:
            # No recognizable state code; could be something like '12th Floor'
            # Just use the street as-is and keep DC defaults
            street = location_str

    return street, city, state, zip_code


def extract_instagram(ig_str: str) -> str:
    """Pull a clean handle (no @) from IG/Info cell."""
    if not ig_str:
        return ""
    # Strip leading @
    handle = ig_str.strip().lstrip("@")
    # If it looks like a URL or email, don't return it as an IG handle
    if "http" in handle or "@" in handle or " " in handle:
        return ""
    return handle


def extract_website(ig_str: str, tickets_str: str) -> str:
    """Return a URL if one can be found in either field."""
    for field in (ig_str, tickets_str):
        if not field:
            continue
        m = re.search(r"https?://\S+", field)
        if m:
            return m.group(0).rstrip(".,)")
    return ""


def map_event_type_to_categories(event_type: str) -> list:
    """Map event type string to LGBTQ+ category tags."""
    base = ["LGBTQ+"]
    if not event_type:
        return base

    lower = event_type.lower()
    mapping = {
        "brunch":      "Food & Drink",
        "happy hour":  "Food & Drink",
        "cookout":     "Food & Drink",
        "day party":   "Nightlife",
        "night party": "Nightlife",
        "pool party":  "Nightlife",
        "rooftop":     "Nightlife",
        "circuit":     "Nightlife",
        "comedy":      "Entertainment",
        "movie":       "Entertainment",
        "screening":   "Entertainment",
        "pageant":     "Entertainment",
        "ball":        "Entertainment",
        "karaoke":     "Entertainment",
        "creative":    "Arts & Culture",
        "art":         "Arts & Culture",
        "poetry":      "Arts & Culture",
        "open mic":    "Arts & Culture",
        "workshop":    "Education",
        "summit":      "Education",
        "forum":       "Education",
        "networking":  "Networking",
        "speed dating":"Social",
        "game night":  "Social",
        "picnic":      "Outdoor",
    }

    extra = set()
    for keyword, category in mapping.items():
        if keyword in lower:
            extra.add(category)

    return base + sorted(extra)


def row_to_frontmatter(row, current_date: str, output_dir: str, index: int):
    """
    Convert one data row to a .md file with YAML-style front matter.
    Returns the output filepath on success, None if skipped.
    """
    event_name = val(row[COL_EVENT])
    if not event_name:
        return None

    promoter   = val(row[COL_PROMO])
    event_type = val(row[COL_TYPE])
    time_raw   = val(row[COL_TIME])
    price_raw  = val(row[COL_PRICE])
    venue_name = val(row[COL_VENUE])
    location   = val(row[COL_LOC])
    ig_info    = val(row[COL_IG])
    tickets    = val(row[COL_TICKET])

    start_time, end_time = parse_time(time_raw)
    street, city, state, zip_code = parse_address(location)
    _, is_free = parse_price(price_raw)

    instagram = extract_instagram(ig_info)
    website   = extract_website(ig_info, tickets)
    categories = map_event_type_to_categories(event_type)

    # Determine city_category
    if state == "DC":
        city_category = "Washington DC"
    elif state == "MD":
        city_category = "Washington DC Metro"
    else:
        city_category = city

    # Build YAML-ish front matter
    def q(s):
        """Wrap a string in single quotes, escaping inner single quotes."""
        return "'" + str(s).replace("'", "\\'") + "'"

    cats_str = "[" + ", ".join(q(c) for c in categories) + "]"
    price_val = 0 if is_free else q(price_raw)
    rsvp = "True" if is_free else "False"

    lines = [
        "---",
        f"event_name: {q(event_name)}",
        f"location_name: {q(venue_name)}",
        f"street_address: {q(street)}",
        f"city: {q(city)}",
        f"city_category: {q(city_category)}",
        f"state: {q(state)}",
        f"zip_code: {q(zip_code)}",
        f"country: 'US'",
        f"start_date: {q(current_date)}",
        f"start_time: {q(start_time)}",
        f"end_time: {q(end_time)}",
        f"time_zone: 'America/New_York'",
        f"organizer: {q(promoter)}",
        f"image: ''",
        f"rsvp_required: {rsvp}",
        f"price: {price_val}",
        f"instagram: {q(instagram)}",
        f"website: {q(website)}",
        f"description: ''",
        f"categories: {cats_str}",
        "---",
        "",
    ]

    slug = slugify(event_name) or f"event_{index}"
    filename = f"{slug}.md"
    filepath = os.path.join(output_dir, filename)

    # Handle duplicate filenames
    if os.path.exists(filepath):
        base, ext = os.path.splitext(filename)
        counter = 2
        while os.path.exists(os.path.join(output_dir, f"{base}_{counter}{ext}")):
            counter += 1
        filename = f"{base}_{counter}{ext}"
        filepath = os.path.join(output_dir, filename)

    with open(filepath, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    return filepath


# ── Main ──────────────────────────────────────────────────────────────────────

def convert(input_path: str, output_dir: str):
    os.makedirs(output_dir, exist_ok=True)

    ext = os.path.splitext(input_path)[1].lower()
    if ext == ".csv":
        df = pd.read_csv(input_path, header=None, dtype=str)
    elif ext in (".xlsx", ".xls"):
        df = pd.read_excel(input_path, header=None, dtype=str)
    else:
        print(f"ERROR: Unsupported file type '{ext}'. Use .csv or .xlsx/.xls.")
        sys.exit(1)

    current_date = ""
    created = []
    skipped = 0

    for i, row in df.iterrows():
        # Pad row to at least 10 columns
        row = list(row) + [""] * max(0, 10 - len(row))

        if is_blank_row(row):
            continue

        if is_date_row(row):
            current_date = parse_date_from_banner(val(row[COL_EVENT]))
            print(f"  📅  Date detected → {val(row[COL_EVENT])}  ({current_date})")
            continue

        if is_header_row(row):
            continue

        # Skip the title / intro rows at the very top
        event_cell = val(row[COL_EVENT]).lower()
        if "blkoutlist" in event_cell or "dc black pride" in event_cell[:20]:
            continue
        if "corrections" in event_cell or "helpful" in event_cell:
            continue

        # Skip if no date context yet
        if not current_date:
            skipped += 1
            continue

        result = row_to_frontmatter(row, current_date, output_dir, i)
        if result:
            created.append(result)
            print(f"  ✅  {os.path.basename(result)}")
        else:
            skipped += 1

    print(f"\nDone. {len(created)} event files created, {skipped} rows skipped.")
    print(f"Output directory: {os.path.abspath(output_dir)}")


def main():
    parser = argparse.ArgumentParser(
        description="Convert DC Black Pride CSV/XLSX to per-event Markdown files."
    )
    parser.add_argument("input_file", help="Path to .csv or .xlsx source file")
    parser.add_argument(
        "--output-dir", "-o",
        default="content/events/dc-pride-2026",
        help="Directory to write .md files into (default: ./content/events/dc-pride-2026)"
    )
    args = parser.parse_args()

    if not os.path.isfile(args.input_file):
        print(f"ERROR: File not found: {args.input_file}")
        sys.exit(1)

    print(f"Converting: {args.input_file}")
    print(f"Output dir: {args.output_dir}\n")
    convert(args.input_file, args.output_dir)


if __name__ == "__main__":
    main()