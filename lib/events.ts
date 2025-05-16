import path from 'path';
import fs from 'fs';
import matter from 'gray-matter';

const rootDirectory = path.join(process.cwd(), 'content', 'events');

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
  date?: string;
  start_time?: string;
  end_time?: string;
  time_zone?: string;
  organizer?: string;
  image?: string;
  rsvp_required?: boolean;
  price?: number;
  instagram?: string;
  website?: string;
  description?: string;
  categories?: string[];
  slug: string;
};

export async function getEventBySlug(slug: string): Promise<Event | null> {
  try {
    const filePath = path.join(rootDirectory, `${slug}.md`);
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
    const files = fs.readdirSync(rootDirectory);
    const events = files
      .filter((file) => file.endsWith('.md'))
      .map((file) => getPostMetadata(file))
      .filter((event) => {
        // Keep only events with dates on or after today
        const today = new Date();
        const eventDate = new Date(event.date ?? '');
        // Normalize both dates to ignore time part
        today.setHours(0, 0, 0, 0);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate >= today;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date ?? '');
        const dateB = new Date(b.date ?? '');

        if (dateA < dateB) return -1; // Earlier dates come first
        if (dateA > dateB) return 1; // Later dates come after

        // If dates are the same, compare start times
        const timeA =
          a.date && a.start_time
            ? new Date(`${a.date} ${a.start_time}`)
            : new Date(8640000000000000);
        const timeB =
          b.date && b.start_time
            ? new Date(`${b.date} ${b.start_time}`)
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
    const files = fs.readdirSync(rootDirectory);
    return files.filter((file) => file.endsWith('.md')).length;
  } catch (error) {
    console.error('Error reading files:', error);
    return 0;
  }
}

// Basically the same as getEventBySlug but only returns metadata
export function getPostMetadata(filepath: string): EventMetadata {
  const slug = filepath.replace(/\.md$/, '');
  const filePath = path.join(rootDirectory, filepath);
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  const fileContent = fs.readFileSync(filePath, { encoding: 'utf8' });
  const { data } = matter(fileContent);
  return { ...data, slug };
}
