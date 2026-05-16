import Link from 'next/link';
import Image from 'next/image';
import React from 'react';
import { BlogPost } from '@/lib/collections';

const BlogCard = ({ blog }: { blog: BlogPost }) => {
  return (
    <Link
      key={blog.slug}
      href={`/blogs/${blog.documentId}`}
      className='group block h-full'>
      <div className='bg-white rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg h-full flex flex-col'>
        {/* Blog image */}
        <div className='relative h-48 w-full'>
          {blog.image && (
            <Image
              src={`${process.env.NEXT_PUBLIC_STRAPI_CMS_URL}${blog.image.url}`}
              alt={blog.title ?? ''}
              fill
              className='object-cover'
            />
          )}
        </div>

        {/* Blog details */}
        <div className='p-4 flex flex-col flex-1'>
          <h3 className='font-bold text-xl mb-1 group-hover:text-primary transition-colors'>
            {blog.title}
          </h3>

          <div className='flex items-center text-muted-foreground mb-4'>
            <span className='text-sm'>{blog.description}</span>
          </div>

          <div className='flex flex-row items-end text-muted-foreground mt-auto'>
            <span className='text-xs text-gray-400'>
              {blog.published_date &&
                new Date(blog.published_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
            </span>
          </div>

          <div>
            {blog.categories && blog.categories.length > 0 && (
              <div className='flex flex-wrap gap-2 mt-2'>
                {blog.categories.map((category) => (
                  <span
                    key={category.id}
                    className='bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs'>
                    {category.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
