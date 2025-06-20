'use client';

import * as React from 'react';

import { Calendar, CalendarDayButton } from '@/components/ui/calendar';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { EventMetadata } from '@/lib/events';
import { formatDate, formatTimezone } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

export default function Calendar31({ events }: { events: EventMetadata[] }) {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  React.useEffect(() => {
    // You can perform any side effect here when events array changes
    // For example, logging the length:
    console.log('Events array length:', events.length);
  }, [events]);

  return (
    <Card className='py-4'>
      <CardContent className='px-4 flex justify-center'>
        <Calendar
          mode='single'
          selected={date}
          onSelect={setDate}
          className='bg-transparent p-0 [--cell-size:--spacing(11)]  md:[--cell-size:--spacing(20)] [&_.rdp-day]:hover:cursor-pointer'
          required
          components={{
            DayButton: ({ children, modifiers, day, ...props }) => {
              // Count events for this specific day, not the selected day
              const eventCount = events.filter((event) => {
                if (!event.start_date) return false;
                const eventDate = new Date(event.start_date);
                return (
                  eventDate.getFullYear() === day.date.getFullYear() &&
                  eventDate.getMonth() === day.date.getMonth() &&
                  eventDate.getDate() === day.date.getDate()
                );
              }).length;

              return (
                <CalendarDayButton day={day} modifiers={modifiers} {...props}>
                  {children}
                  {!modifiers.outside && eventCount > 0 && (
                    <span className='inline-flex gap-0.5'>
                      {eventCount > 3
                        ? Array.from({ length: 3 }).map((_, i) => (
                            <span
                              key={i}
                              className='inline-block w-1 h-1 bg-primary rounded-full'
                            />
                          ))
                        : Array.from({ length: eventCount }).map((_, i) => (
                            <span
                              key={i}
                              className='inline-block w-1 h-1 bg-primary rounded-full'
                            />
                          ))}
                    </span>
                  )}
                </CalendarDayButton>
              );
            },
          }}
        />
      </CardContent>
      <CardFooter className='flex flex-col items-start gap-3 border-t px-4 !pt-4'>
        <div className='flex w-full items-center justify-between px-1'>
          <div className='text-sm font-medium'>
            {date?.toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </div>
        </div>
        <div className='flex w-full flex-col gap-2'>
          {(() => {
            const filteredEvents = events.filter((event) => {
              if (!date) return false;
              const eventDate = new Date(event.start_date ?? '');
              return (
                eventDate.getFullYear() === date.getFullYear() &&
                eventDate.getMonth() === date.getMonth() &&
                eventDate.getDate() === date.getDate()
              );
            });

            return filteredEvents.length > 0 ? (
              filteredEvents
                .map((event) => (
                  <Link key={event.slug} href={`/events/${event.slug}`}>
                    <div
                      key={event.event_name}
                      className='bg-muted after:bg-primary/70 relative rounded-md p-2 pl-6 text-sm after:absolute after:inset-y-2 after:left-2 after:w-1 after:rounded-full hover:cursor-pointer'>
                      <div
                        className='font-bold text-base break-words'
                        style={{ width: 'calc(100% - 50px)' }}>
                        {event.event_name}
                      </div>
                      <div className='font-medium'>
                        {event.city}, {event.state}
                      </div>
                      <div
                        className='text-muted-foreground text-xs break-words'
                        style={{ width: 'calc(100% - 50px)' }}>
                        {formatDate(event.start_date ?? '')}
                        {event.end_date &&
                          event.end_date !== '' &&
                          event.end_date !== event.start_date && (
                            <> - {formatDate(event.end_date)}</>
                          )}
                        {', '} {event.start_time} - {event.end_time}{' '}
                        {formatTimezone(event.time_zone)}
                      </div>
                      {
                        <div className='absolute right-0 top-0 h-full w-[50px] md:w-[100px] lg:w-[200px] rounded-r-md overflow-hidden shadow'>
                          <Image
                            src={
                              event.image ||
                              (event.city_category
                                ? `/images/${event.city_category.toLowerCase().replace(/\s+/g, '-')}.jpg`
                                : event.city
                                  ? `/images/${event.city.toLowerCase().replace(/\s+/g, '-')}.jpg`
                                  : '/images/black-gay-pride.png')
                            }
                            alt={event.event_name ?? 'Event Flyer Image'}
                            fill
                            className='object-cover'
                          />
                        </div>
                      }
                    </div>
                  </Link>
                ))
                .sort((a, b) => {
                  const eventA = events.find((e) => e.event_name === a.key);
                  const eventB = events.find((e) => e.event_name === b.key);
                  const dateA = eventA
                    ? new Date(eventA.start_date ?? '')
                    : new Date(0);
                  const dateB = eventB
                    ? new Date(eventB.start_date ?? '')
                    : new Date(0);
                  return dateA.getTime() - dateB.getTime();
                })
            ) : (
              <div className='bg-muted after:bg-primary/70 relative rounded-md p-2 pl-6 text-sm after:absolute after:inset-y-2 after:left-2 after:w-1 after:rounded-full'>
                No events for this date.
              </div>
            );
          })()}
        </div>
      </CardFooter>
    </Card>
  );
}
