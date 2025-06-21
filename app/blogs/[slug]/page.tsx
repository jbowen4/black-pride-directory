import { notFound } from 'next/navigation';
import React from 'react';
import Image from 'next/image';
import { Metadata } from 'next';
import { fetchAll, fetchOne, CollectionType } from '@/lib/fetch';
import { Calendar } from 'lucide-react';

export async function generateStaticParams() {
  const blogs = await fetchAll(CollectionType.BlogPost);
  const slugs = blogs.map((blog: any) => ({ slug: blog.slug }));
  return slugs;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const blog_post = await fetchOne(CollectionType.BlogPost, slug);

  const {
    title,
    description,
    image,
    //image: { url },
  } = blog_post;

  const url = null;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/blogs/${slug}`,
      images: [
        {
          url: url ?? '/images/black-gay-pride.png',
          alt: title,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [url ?? '/images/black-gay-pride.png'],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const blog_post = await fetchOne(CollectionType.BlogPost, slug);

  if (!blog_post) {
    notFound();
  }

  const {
    title,
    description,
    image,
    //image: { url },
  } = blog_post;

  const url = null;

  return (
    <div>
      <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4'>
        {/* Blog Details */}
        <div className='mb-8'>
          <h1 className='text-4xl font-bold mb-8'>{title}</h1>
          <div>
            <div className='flex items-center text-muted-foreground mb-4 gap-4'>
              {/* Date */}
              {blog_post.published_date && (
                <span className='flex items-center gap-1 text-sm'>
                  <Calendar className='w-4 h-4 mr-1' />
                  {new Date(blog_post.published_date).toLocaleDateString(
                    'en-US',
                    {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    }
                  )}
                </span>
              )}
              {/* Author */}
              {blog_post.author && (
                <span className='flex items-center gap-2 text-sm'>
                  <Image
                    src={
                      blog_post.author.avatar?.url
                        ? `${process.env.NEXT_PUBLIC_STRAPI_CMS_URL}${blog_post.author.avatar.url}`
                        : '/images/default-avatar.jpg'
                    }
                    alt={blog_post.author.name}
                    width={28}
                    height={28}
                    className='rounded-full h-7 w-7 object-cover'
                  />
                  <span>{blog_post.author.name}</span>
                </span>
              )}
            </div>

            <p className='text-lg font-medium'>{description}</p>
          </div>
        </div>
        {/* Blog Image */}
        {image && (
          <div className='flex justify-center mb-8'>
            <div className='relative w-full max-h-[400px] overflow-hidden rounded-lg'>
              <Image
                src={`${process.env.NEXT_PUBLIC_STRAPI_CMS_URL}${image.url}`}
                alt={title || 'Placeholder Image'}
                width={1200}
                height={400}
                className='object-cover w-full max-h-[400px]'
              />
            </div>
          </div>
        )}
        {/* Blog Content */}
        <div className='prose prose-lg max-w-none'>
          {blog_post.content.map(
            (
              block: { type: string; children: Array<{ text: string }> },
              index: number
            ) => {
              if (block.type === 'paragraph') {
                return (
                  <p key={index} className='mb-4'>
                    {block.children.map((child, i) => (
                      <span key={i}>{child.text}</span>
                    ))}
                  </p>
                );
              }

              // Add support for other block types here if needed
              return null;
            }
          )}
        </div>
        {/* Categories */}
        {blog_post.categories && blog_post.categories.length > 0 && (
          <div className='mb-2'>
            <h2 className='text-lg font-semibold mt-12 mb-4'>Categories</h2>
            <div className='flex flex-wrap gap-2'>
              {blog_post.categories.map((category: any) => (
                <span
                  key={category.id}
                  className='bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs'>
                  {category.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
