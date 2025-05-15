'use client';

import type React from 'react';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Subscribe() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle subscription logic here
    console.log(`Subscribing email: ${email}`);
    // You would typically send this to your API
    alert(`Thanks for subscribing with ${email}!`);
    setEmail('');
  };

  return (
    <section className='py-16'>
      <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='bg-gray-50 rounded-2xl p-8 md:p-12'>
          <div className='max-w-3xl mx-auto text-center'>
            <h2 className='text-3xl font-bold mb-4'>
              Subscribe to our mailing list
            </h2>

            <p className='text-muted-foreground mb-8'>
              Subscribe to stay up to date with all the latest events &
              resources in the queer Black community <br />
              <em>(And we won't email you much, we promise!)</em>
            </p>

            <form
              onSubmit={handleSubscribe}
              className='flex flex-col sm:flex-row gap-3 justify-center'>
              <Input
                type='email'
                placeholder='Enter your email'
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                required
                className='max-w-md'
              />
              <Button type='submit'>Subscribe</Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
