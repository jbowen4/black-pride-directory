import path from 'path';
import fs from 'fs';
import matter from 'gray-matter';

const rootDirectory = path.join(process.cwd(), 'content', 'cities');

export type City = {
  metadata: CityMetadata;
  content: string;
};

export type CityMetadata = {
  name?: string;
  instagram?: string;
  website?: string;
  image?: string;
  organizers?: string;
  sponsors?: string[];
  description?: string;
  slug: string;
};

export async function getCities(limit?: number): Promise<CityMetadata[]> {
  try {
    const files = fs.readdirSync(rootDirectory);
    const events = files
      .filter((file) => file.endsWith('.md'))
      .map((file) => getPostMetadata(file));

    if (limit) {
      return events.slice(0, limit);
    }
    return events;
  } catch (error) {
    console.error('Error reading files:', error);
    return [];
  }
}

export function countCities(): number {
  try {
    const files = fs.readdirSync(rootDirectory);
    return files.filter((file) => file.endsWith('.md')).length;
  } catch (error) {
    console.error('Error reading files:', error);
    return 0;
  }
}

export function getPostMetadata(filepath: string): CityMetadata {
  const slug = filepath.replace(/\.md$/, '');
  const filePath = path.join(rootDirectory, filepath);
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  const fileContent = fs.readFileSync(filePath, { encoding: 'utf8' });
  const { data } = matter(fileContent);
  return { ...data, slug };
}
