import { Author, BlogPost, Category } from './collections';

export enum CollectionType {
  BlogPost = 'blog-posts',
  Category = 'categories',
  Author = 'authors',
}
type CollectionTypeMap = {
  [CollectionType.BlogPost]: BlogPost;
  [CollectionType.Category]: Category;
  [CollectionType.Author]: Author;
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
    console.log(response);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}
