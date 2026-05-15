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

export type Organizer = {
  id: number;
  name: string;
  description?: string;
  image?: StrapiImage;
  events?: Array<Event>;
  [key: string]: any;
};

export type Event = {
  id: number;
  //documentId: string;
  event_name: string;
  description?: string;
  start_datetime: Date;
  end_datetime: Date;
  location?: string;
  image?: StrapiImage;
  organizers?: Array<Organizer>;
  sponsors?: Array<Sponsor>;
  slug: string;
  [key: string]: any;
};

export type Sponsor = {
  id: number;
  name: string;
  description?: string;
  image?: StrapiImage;
  events?: Array<Event>;
  [key: string]: any;
};

export type City = {
  id: number;
  name: string;
  description?: string;
  image?: StrapiImage;
  events?: Array<Event>;
  [key: string]: any;
};
