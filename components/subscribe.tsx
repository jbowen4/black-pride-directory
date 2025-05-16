'use client';

import { z } from 'zod';
import Link from 'next/link';
import { toast } from 'sonner';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { NewsletterFormSchema } from '@/lib/schemas';
import { subscribe } from '@/lib/actions';

type Inputs = z.infer<typeof NewsletterFormSchema>;

import type React from 'react';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Subscribe() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>({
    resolver: zodResolver(NewsletterFormSchema),
    defaultValues: {
      email: '',
    },
  });

  const processForm: SubmitHandler<Inputs> = async (data) => {
    const result = await subscribe(data);

    if (result?.error) {
      toast.error('An error occurred! Please try again.');
      return;
    }

    toast.success('Subscribed successfully!');
    reset();
  };

  return (
    <section id='subscribe' className='py-16'>
      <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='bg-gray-50 rounded-2xl p-8 md:p-12'>
          <div className='max-w-3xl mx-auto text-center'>
            <h2 className='text-3xl font-bold mb-4'>
              Subscribe to our mailing list
            </h2>

            <p className='text-muted-foreground mb-8'>
              Subscribe to stay up to date with all the latest events &
              resources in the queer Black community <br />
              <em>(And we won&rsquo;t email you much, we promise!)</em>
            </p>

            <form
              onSubmit={handleSubmit(processForm)}
              className='flex flex-col sm:flex-row gap-3 justify-center'>
              <Input
                type='email'
                id='email'
                autoComplete='email'
                placeholder='Enter your email'
                {...register('email')}
                required
                className='max-w-md'
              />
              <Button
                type='submit'
                disabled={isSubmitting}
                className='disabled:opacity-50 hover:cursor-pointer'>
                {isSubmitting ? 'Submitting...' : 'Subscribe'}
              </Button>
            </form>
            {errors.email?.message && (
              <p className='ml-1 mt-2 text-sm text-rose-400'>
                {errors.email.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
