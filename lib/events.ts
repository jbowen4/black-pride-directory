import path from 'path';
import fs from 'fs';
import matter from 'gray-matter';
import { StrapiImage } from './collections';

const rootDirectory = path.join(process.cwd(), 'content', 'events');

function getAllMarkdownFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllMarkdownFiles(fullPath));
    } else if (entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  return files;
}

function findMarkdownBySlug(dir: string, slug: string): string | null {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const found = findMarkdownBySlug(fullPath, slug);
      if (found) return found;
    } else if (entry.name === `${slug}.md`) {
      return fullPath;
    }
  }
  return null;
}

export type Event = {
  metadata: EventMetadata;
  content: string;
};

export type EventMetadata = {
  event_name?: string;
  location_name?: string;
  street_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  time_zone?: string;
  organizer?: string;
  image?: string | StrapiImage;
  rsvp_required?: boolean;
  price?: number;
  instagram?: string;
  website?: string;
  description?: string;
  categories?: string[];
  city_category?: string; // New field for city category
  slug: string;
  city_name?: string;
};

export async function getEventBySlug(slug: string): Promise<Event | null> {
  try {
    const filePath = findMarkdownBySlug(rootDirectory, slug);
    if (!filePath) return null;
    const fileContent = fs.readFileSync(filePath, { encoding: 'utf8' });
    const { data, content } = matter(fileContent);
    return { metadata: { ...data, slug }, content };
  } catch (error) {
    console.error('Error reading file:', error);
    return null;
  }
}

export async function getEvents(limit?: number): Promise<EventMetadata[]> {
  try {
    const files = getAllMarkdownFiles(rootDirectory);
    const events = files
      .map((file) => getPostMetadata(file))
      // .filter((event) => {
      //   // Keep only events with dates on or after today
      //   const today = new Date();
      //   const eventDate = new Date(event.end_date ?? event.start_date ?? '');
      //   // Normalize both dates to ignore time part
      //   today.setHours(0, 0, 0, 0);
      //   eventDate.setHours(0, 0, 0, 0);
      //   return eventDate >= today;
      // })
      .sort((a, b) => {
        const dateA = new Date(a.start_date ?? '');
        const dateB = new Date(b.start_date ?? '');

        if (dateA < dateB) return -1; // Earlier dates come first
        if (dateA > dateB) return 1; // Later dates come after

        // If dates are the same, compare start times
        const timeA =
          a.start_date && a.start_time
            ? new Date(`${a.start_date} ${a.start_time}`)
            : new Date(8640000000000000);
        const timeB =
          b.start_date && b.start_time
            ? new Date(`${b.start_date} ${b.start_time}`)
            : new Date(8640000000000000);

        return timeA.getTime() - timeB.getTime();
      });

    if (limit) {
      return events.slice(0, limit);
    }
    return events;
  } catch (error) {
    console.error('Error reading files:', error);
    return [];
  }
}

export function countEvents(): number {
  try {
    return getAllMarkdownFiles(rootDirectory).length;
  } catch (error) {
    console.error('Error reading files:', error);
    return 0;
  }
}

// Basically the same as getEventBySlug but only returns metadata
export function getPostMetadata(filepath: string): EventMetadata {
  const slug = path.basename(filepath, '.md');
  if (!fs.existsSync(filepath)) {
    throw new Error(`File not found: ${filepath}`);
  }
  const fileContent = fs.readFileSync(filepath, { encoding: 'utf8' });
  const { data } = matter(fileContent);
  return { ...data, slug };
}
