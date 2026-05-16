# Black Pride Directory

A directory of Black pride events across the US and globally. Built with Next.js 15, TypeScript, and Tailwind CSS. Events are managed via Markdown files and optionally via a Strapi CMS backend.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Adding Events](#adding-events)
  - [Manually via .md file](#manually-via-md-file)
  - [Bulk import from Excel](#bulk-import-from-excel)
  - [Via Strapi CMS](#via-strapi-cms)
- [Event Frontmatter Schema](#event-frontmatter-schema)
- [Project Structure](#project-structure)
- [Deployment](#deployment)

---

## Prerequisites

- **Node.js** 18 or later
- **npm** (bundled with Node)
- **Python 3.9+** — only needed for the bulk-import automation scripts

---

## Local Setup

```bash
# 1. Clone the repo
git clone <repo-url>
cd black-pride-directory

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local   # (create .env.example first — see below)
# Edit .env.local and fill in the required values

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

> **Note:** Strapi CMS is optional for local development. If `NEXT_PUBLIC_STRAPI_CMS_URL` is not set or Strapi is not running, the app falls back gracefully to Markdown-only data.

---

## Environment Variables

Create a `.env.local` file in the project root with the following:

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_BASE_URL` | Yes | Full deployment URL, e.g. `https://blackpridedirectory.com` |
| `RESEND_API_KEY` | Yes | [Resend](https://resend.com) API key for email |
| `RESEND_AUDIENCE_ID` | Yes | Resend mailing list audience ID |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Yes | Google Maps JavaScript API key |
| `STRAPI_API_TOKEN` | Optional | Read-only Strapi Bearer token |
| `STRAPI_FULL_ACCESS_API_TOKEN` | Optional | Write-access Strapi Bearer token (for event submission) |
| `NEXT_PUBLIC_STRAPI_CMS_URL` | Optional | Strapi base URL — default `http://127.0.0.1:1337` |
| `NEXT_PUBLIC_EVENT_SUBMISSION_PASSWORD` | Optional | Password gate on the `/post` event submission form |

---

## Development

```bash
npm run dev     # Start dev server (http://localhost:3000)
npm run build   # Production build
npm run start   # Serve production build locally
npm run lint    # Run ESLint
```

---

## Adding Events

### Manually via .md file

1. Create a new file in `content/events/` with a kebab-case filename, e.g. `my-event-name.md`.
2. Add YAML frontmatter at the top of the file (see [Event Frontmatter Schema](#event-frontmatter-schema) below).
3. The filename (without `.md`) becomes the event's URL slug: `/events/my-event-name`.
4. Restart the dev server or trigger a rebuild for the event to appear.

**Example:**
```
content/events/rooftop-day-party-dc.md
```

```yaml
---
event_name: 'Rooftop Day Party DC'
location_name: 'The Rooftop at 14th'
street_address: '920 14th St NW'
city: 'Washington'
city_category: 'Washington DC'
state: 'DC'
zip_code: ''
country: 'US'
start_date: '6/14/2026'
end_date: ''
start_time: '2:00 PM'
end_time: '8:00 PM'
time_zone: 'America/New_York'
organizer: 'Organizer Name'
image: 'https://example.com/image.jpg'
rsvp_required: false
price: 20
instagram: 'organizerhandle'
website: 'https://example.com/tickets'
description: 'A description of the event.'
categories:
  - 'LGBTQ+'
  - 'Nightlife'
---
```

### Bulk import from Excel

The Python automation pipeline converts a spreadsheet to individual `.md` files:

```bash
# 1. Install Python dependencies
pip install openpyxl pyyaml requests beautifulsoup4

# 2. Place your spreadsheet as blkoutlist.xlsx in the project root

# 3. Generate .md files (outputs to events_md/)
python excel-converter.py

# 4. (Optional) Fetch event images from website URLs
python fetch_images.py

# 5. Review generated files in events_md/

# 6. Move approved files to content/events/ for the app to serve
mv events_md/*.md content/events/
```

> `events_md/` is a staging directory — files there are not read by the app until moved to `content/events/`.

### Via Strapi CMS

> Strapi is currently local-dev only. There is no production Strapi instance.

1. Start Strapi: `npm run develop` in the Strapi project directory
2. Open [http://127.0.0.1:1337/admin](http://127.0.0.1:1337/admin)
3. Navigate to Content Manager → Events → Create new entry
4. Fill in fields and publish

Alternatively, use the event submission form at `/post` on the site (requires `NEXT_PUBLIC_EVENT_SUBMISSION_PASSWORD`).

---

## Event Frontmatter Schema

| Field | Type | Required | Notes |
|---|---|---|---|
| `event_name` | string | Yes | Display name of the event |
| `location_name` | string | No | Venue name |
| `street_address` | string | No | Street address |
| `city` | string | No | City name only (e.g. `Washington`) |
| `city_category` | string | No | Filter group used by UI (e.g. `Washington DC`) — must match a value in the city list |
| `state` | string | No | 2-letter state code (e.g. `DC`) |
| `zip_code` | string | No | Postal code |
| `country` | string | No | Country code (e.g. `US`) |
| `start_date` | string | No | Format: `M/D/YYYY` (e.g. `5/24/2026`) |
| `end_date` | string | No | Format: `M/D/YYYY` — for multi-day events |
| `start_time` | string | No | Format: `H:MM AM/PM` (e.g. `10:00 PM`) |
| `end_time` | string | No | Format: `H:MM AM/PM` |
| `time_zone` | string | No | IANA timezone (e.g. `America/New_York`) |
| `organizer` | string | No | Organizer or host name |
| `image` | string | No | Full image URL |
| `rsvp_required` | boolean | No | `true` or `false` |
| `price` | number or string | No | `0` for free, number for fixed price, or string like `'Price at Door'` |
| `instagram` | string | No | Instagram handle without `@` |
| `website` | string | No | Full URL to tickets or event page |
| `description` | string | No | Short event description |
| `categories` | string[] | No | Array of category strings (see valid values below) |

**Valid categories:** `LGBTQ+`, `Arts & Culture`, `Nightlife`, `Sports & Fitness`, `Food & Drink`, `Music`, `Film`, `Education`, `Community`, `Health & Wellness`, `Fashion`, `Business`

**Valid city_category values:** `Washington DC`, `Atlanta`, `Chicago`, `Dallas`, `Houston`, `Los Angeles`, `Miami`, `New York`, `Orlando`, `Philadelphia`, `San Francisco`

---

## Project Structure

```
app/            Next.js App Router pages and API routes
components/     React components (ui/ subdirectory = shadcn/ui, do not edit directly)
lib/            Core utilities: event loader, Strapi client, TypeScript types
content/        Active Markdown content (events/ and cities/)
events_md/      Staging area for bulk-imported .md files (not served by app)
public/         Static assets and images
```

For a full breakdown, see [CLAUDE.md](CLAUDE.md).

---

## Deployment

The site deploys to [Vercel](https://vercel.com). To deploy:

1. Push to the `main` branch — Vercel auto-deploys on push.
2. Set all required environment variables in the Vercel project dashboard (Settings → Environment Variables). The `.env.local` file is not deployed.
3. `NEXT_PUBLIC_BASE_URL` must match the production domain for sitemap and OG tag generation.

> **Strapi**: Until a production Strapi instance is deployed and `NEXT_PUBLIC_STRAPI_CMS_URL` updated, blog posts and Strapi-managed events will not appear on the production site. The app degrades gracefully (no crash).
