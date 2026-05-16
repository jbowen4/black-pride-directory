import {
  Author,
  BlogPost,
  Category,
  City,
  Organizer,
  Sponsor,
  Event,
} from './collections';

export enum CollectionType {
  BlogPost = 'blog-posts',
  Category = 'categories',
  Author = 'authors',
  Organizer = 'organizers',
  Event = 'events',
  Sponsor = 'sponsors',
  City = 'cities',
}

export type CollectionTypeMap = {
  [CollectionType.BlogPost]: BlogPost;
  [CollectionType.Category]: Category;
  [CollectionType.Author]: Author;
  [CollectionType.Organizer]: Organizer;
  [CollectionType.Event]: Event;
  [CollectionType.Sponsor]: Sponsor;
  [CollectionType.City]: City;
};

export async function fetchAll<T extends CollectionType>(
  collection: T
): Promise<CollectionTypeMap[T][]> {
  const baseUrl = process.env.NEXT_PUBLIC_STRAPI_CMS_URL;
  if (!baseUrl) return [];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(
      `${baseUrl}/api/${collection}?populate=*`,
      {
        headers: { Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}` },
        signal: controller.signal,
      }
    );
    const response = await res.json();
    return response.data as CollectionTypeMap[T][];
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchOne(collection: CollectionType, documentId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_STRAPI_CMS_URL;
  if (!baseUrl) return undefined;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(
      `${baseUrl}/api/${collection}/${documentId}?populate=*`,
      {
        headers: { Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}` },
        signal: controller.signal,
      }
    );
    const response = await res.json();
    return response.data;
  } catch {
    return undefined;
  } finally {
    clearTimeout(timeout);
  }
}

export async function postOne<T extends CollectionType>(
  collection: T,
  data: object
): Promise<CollectionTypeMap[T] | undefined> {
  const baseUrl = process.env.NEXT_PUBLIC_STRAPI_CMS_URL;
  if (!baseUrl) return undefined;

  try {
    const res = await fetch(
      `${baseUrl}/api/${collection}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.STRAPI_FULL_ACCESS_API_TOKEN}`,
        },
        body: JSON.stringify({ data }),
      }
    );
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Failed to POST — Status: ${res.status}`, errorText);
      return undefined;
    }
    const response = await res.json();
    if (!response?.data) {
      console.error('Unexpected response format:', response);
      return undefined;
    }
    return response.data;
  } catch (error) {
    console.error('Error posting data:', error);
    return undefined;
  }
}
