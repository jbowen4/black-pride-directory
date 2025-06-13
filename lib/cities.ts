import path from 'path';
import fs from 'fs';
import matter from 'gray-matter';

const rootDirectory = path.join(process.cwd(), 'content', 'cities');

export type City = {
  metadata: CityMetadata;
  content: string;
};

export type CityMetadata = {
  event_name?: string;
  city_name?: string;
  instagram?: string;
  website?: string;
  image?: string;
  organizers?: string;
  sponsors?: string[];
  description?: string;
  popular_city?: boolean;
  slug: string;
};

export async function getCityBySlug(slug: string): Promise<City | null> {
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

export async function getCities(limit?: number): Promise<CityMetadata[]> {
  try {
    const files = fs.readdirSync(rootDirectory);
    const cities = files
      .filter((file) => file.endsWith('.md'))
      .map((file) => getPostMetadata(file))
      .sort((a, b) => {
        // Sort by popular_city: true first, then false or undefined
        if (a.popular_city === b.popular_city) return 0;
        if (a.popular_city) return -1;
        return 1;
      });

    if (limit) {
      return cities.slice(0, limit);
    }
    return cities;
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
