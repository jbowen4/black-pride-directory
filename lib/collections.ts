export type BlogPost = {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  author: Author;
  description: string;
  published_date: Date;
  content: Array<Object>;
  image?: StrapiImage;
  categories?: Array<Category>;
  [key: string]: any;
};

export type Category = {
  id: number;
  name: string;
  description?: string;
  blog_posts?: Array<BlogPost>;
};

export type Author = {
  id: number;
  name: string;
  biography?: string;
  image?: StrapiImage;
  blog_posts?: Array<BlogPost>;
};

export type StrapiImage = {
  id: number;
  documentId: string;
  name: string;
  alternativeText?: string;
  caption?: string;
  width: number;
  height: number;
  url?: string;
  ext: string;
  mime: string;
  [key: string]: any;
};
