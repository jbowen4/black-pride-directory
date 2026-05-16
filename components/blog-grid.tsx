'use client';

import BlogCard from '@/components/blog-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BlogPost, Category } from '@/lib/collections';
import React, { useState } from 'react';

export default function BlogGrid({
  blogs,
  categories,
}: {
  blogs: BlogPost[];
  categories: Category[];
}) {
  //console.log(blogs);
  blogs = blogs ?? [];
  categories = categories ?? [];

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');

  const filteredBlogs = blogs
    ? blogs.filter((blog) => {
        return (
          blog.title?.toLowerCase().includes(query.toLowerCase()) &&
          (category
            ? Array.isArray(blog.categories) &&
              blog.categories
                .map((c) => c.name.toLowerCase())
                .includes(category.toLowerCase())
            : true)
        );
      })
    : [];

  const resetFields = () => {
    setQuery('');
    setCategory('');
  };

  return (
    <>
      <div className='flex w-full max-w-4xl flex-col lg:flex-row mx-auto items-stretch gap-2 pb-8'>
        <Input
          type='text'
          placeholder='Search an blog post...'
          className='w-full h-12 min-h-12 focus:outline-none focus:outline-hidden flex-[1]'
          onChange={(e) => setQuery(e.target.value)}
          value={query}
        />
        <div className='w-full flex gap-2 flex-[1]'>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className='w-[180px] py-6'>
              <SelectValue placeholder='Blog Post Category' />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Categories</SelectLabel>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button
            className='flex-[1.5] w-full h-13 hover:cursor-pointer'
            onClick={resetFields}>
            Reset
          </Button>
        </div>
      </div>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
        {filteredBlogs.map((blog) => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
      </div>
    </>
  );
}
