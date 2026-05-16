#!/usr/bin/env python3
"""
Delete all events from a Strapi instance.

Usage:
    python delete_all_events.py --token YOUR_TOKEN
    python delete_all_events.py --token YOUR_TOKEN --url http://localhost:1337
"""

import argparse
import os
import sys
import time

import requests


def make_headers(token: str) -> dict:
    return {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}",
    }


def get_all_document_ids(base_url: str, collection: str, headers: dict) -> list[str]:
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
            doc_ids.append(item.get("documentId") or str(item["id"]))
        meta = body.get("meta", {}).get("pagination", {})
        if page >= meta.get("pageCount", 1):
            break
        page += 1
    return doc_ids


def main():
    parser = argparse.ArgumentParser(description="Delete all events from Strapi.")
    parser.add_argument(
        "--token",
        required=True,
        default=os.environ.get("STRAPI_TOKEN", ""),
        help="Strapi API token (or set STRAPI_TOKEN env var)",
    )
    parser.add_argument(
        "--url",
        default="http://localhost:1337",
        help="Strapi base URL (default: http://localhost:1337)",
    )
    parser.add_argument(
        "--collection", default="events", help="Collection slug (default: events)"
    )
    args = parser.parse_args()

    token = args.token or os.environ.get("STRAPI_TOKEN", "")
    if not token:
        print("ERROR: No API token. Use --token or set STRAPI_TOKEN env var.")
        sys.exit(1)

    headers = make_headers(token)
    base_url = args.url.rstrip("/")
    collection = args.collection

    # Connectivity check
    try:
        ping = requests.get(
            f"{base_url}/api/{collection}?pagination[pageSize]=1",
            headers=headers,
            timeout=5,
        )
        if ping.status_code == 401:
            print("ERROR: 401 Unauthorized — check your API token.")
            sys.exit(1)
        elif ping.status_code == 404:
            print(f"ERROR: 404 — collection '{collection}' not found.")
            sys.exit(1)
        ping.raise_for_status()
    except requests.exceptions.ConnectionError:
        print(f"ERROR: Cannot connect to {base_url}. Is Strapi running?")
        sys.exit(1)

    print(f"Fetching all entries from {base_url}/api/{collection}...")
    doc_ids = get_all_document_ids(base_url, collection, headers)

    if not doc_ids:
        print("Nothing to delete.")
        sys.exit(0)

    print(f"Found {len(doc_ids)} entries. Deleting", end="", flush=True)

    failed = []
    for doc_id in doc_ids:
        try:
            resp = requests.delete(
                f"{base_url}/api/{collection}/{doc_id}",
                headers=headers,
                timeout=10,
            )
            resp.raise_for_status()
            print(".", end="", flush=True)
        except Exception as e:
            print("x", end="", flush=True)
            failed.append((doc_id, str(e)))
        time.sleep(0.05)

    print()
    print(f"\nDeleted: {len(doc_ids) - len(failed)}/{len(doc_ids)}")
    if failed:
        print(f"Failed:  {len(failed)}")
        for doc_id, reason in failed:
            print(f"  • {doc_id}: {reason}")


if __name__ == "__main__":
    main()
