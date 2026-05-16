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
  const options = {
    headers: {
      Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
    },
  };
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_CMS_URL}/api/${collection}?populate=*`,
      options
    );
    const response = await res.json();
    return response.data as CollectionTypeMap[T][];
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
}

export async function fetchOne(collection: CollectionType, documentId: string) {
  const options = {
    headers: {
      Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
    },
  };
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_CMS_URL}/api/${collection}/${documentId}?populate=*`,
      options
    );
    const response = await res.json();
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

export async function postOne<T extends CollectionType>(
  collection: T,
  data: object
): Promise<CollectionTypeMap[T] | undefined> {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.STRAPI_FULL_ACCESS_API_TOKEN}`,
    },
    // TODO: Check the data structure against the expected type before sending
    body: JSON.stringify({ data }),
  };
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_CMS_URL}/api/${collection}`,
      options
    );
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`❌ Failed to POST — Status: ${res.status}`);
      console.error('Response text:', errorText);
      //res.text().message
      return undefined;
    }
    const response = await res.json();
    if (!response?.data) {
      console.error('❌ Unexpected response format:', response);
      return undefined;
    }
    return response.data;
  } catch (error) {
    console.log('ERRORRRORRORRR');
    console.log(error);
    console.error('Error posting data:', error);
  }
}
