import BlogGrid from '@/components/blog-grid';
import { CollectionType, fetchAll } from '@/lib/fetch';

export default async function BlogsPage() {
  const blogs = await fetchAll(CollectionType.BlogPost);
  const categories = await fetchAll(CollectionType.Category);

  //console.log(blogs);

  return (
    <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12'>
      <h1 className='text-4xl font-bold text-center mb-16'>Blog Posts</h1>
      <BlogGrid blogs={blogs} categories={categories} />
    </div>
  );
}
