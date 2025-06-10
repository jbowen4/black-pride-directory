'use client';

import React from 'react';
import { Event } from '@/lib/events';
import AddToCalendarButton from '@/components/add-to-calendar-button';
import ShareButton from './share-button';

const ShareAndAddToCalendar = ({ event }: { event: Event }) => {
  return (
    <div className='mt-6 flex gap-4'>
      <ShareButton />
      <AddToCalendarButton event={event} />
    </div>
  );
};

export default ShareAndAddToCalendar;
