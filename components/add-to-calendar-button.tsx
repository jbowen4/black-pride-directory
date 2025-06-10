'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Calendar } from 'lucide-react';
import { Event } from '@/lib/events';
import { formatDatetime, formatLocation } from '@/lib/utils';

export default function AddToCalendarButton({ event }: { event: Event }) {
  const [showModal, setShowModal] = useState(false);

  const {
    event_name = 'Event',
    location_name = 'TBD',
    street_address = '',
    city = '',
    state = '',
    zip_code = '',
    country = '',
    start_date = '2025-06-15',
    end_date = start_date || '2025-06-15',
    description = 'No description provided',
    start_time = '09:00',
    end_time = '10:00',
    time_zone = 'America/New_York',
  } = event.metadata || {};

  const generateICS = () => {
    const icsContent = `BEGIN:VCALENDAR
    VERSION:2.0
    CALSCALE:GREGORIAN
    METHOD:PUBLISH
    BEGIN:VTIMEZONE
    TZID:${time_zone}
    X-LIC-LOCATION:${time_zone}
    BEGIN:DAYLIGHT
    TZOFFSETFROM:-0500
    TZOFFSETTO:-0400
    TZNAME:EDT
    DTSTART:19700308T020000
    RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU
    END:DAYLIGHT
    BEGIN:STANDARD
    TZOFFSETFROM:-0400
    TZOFFSETTO:-0500
    TZNAME:EST
    DTSTART:19701101T020000
    RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU
    END:STANDARD
    END:VTIMEZONE
    BEGIN:VEVENT
    SUMMARY:${event_name}
    DESCRIPTION:${description}
    LOCATION:${formatLocation(location_name, street_address, city, state, zip_code, country)}
    DTSTART;TZID=${time_zone}:${formatDatetime(start_date, start_time)}
    DTEND;TZID=${time_zone}:${formatDatetime(end_date, end_time)}
    END:VEVENT
    END:VCALENDAR`;

    const blob = new Blob([icsContent], {
      type: 'text/calendar;charset=utf-8',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'event.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openGoogleCalendar = () => {
    const startStr = formatDatetime(start_date, start_time);
    const endStr = formatDatetime(end_date, end_time);

    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      event_name
    )}&dates=${startStr}/${endStr}&details=${encodeURIComponent(
      description
    )}&location=${encodeURIComponent(formatLocation(location_name, street_address, city, state, zip_code, country))}`;

    window.open(url, '_blank');
  };

  return (
    <>
      <Button
        className='flex-1 font-bold rounded-lg py-6 hover:cursor-pointer  hover:bg-zinc-200 transition-transform duration-200 hover:scale-105'
        variant='secondary'
        onClick={() => setShowModal(true)}>
        <Calendar />
        Add to Calendar
      </Button>

      {showModal && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg shadow-lg p-6 w-full max-w-sm'>
            <h2 className='text-lg font-semibold mb-4 text-center'>
              Choose Calendar
            </h2>
            <div className='flex flex-col gap-4'>
              <button
                onClick={() => {
                  generateICS();
                  setShowModal(false);
                }}
                className='bg-zinc-900 text-white py-2 rounded hover:cursor-pointer hover:bg-zinc-800 transition'>
                Apple Calendar (.ics)
              </button>
              <button
                onClick={() => {
                  openGoogleCalendar();
                  setShowModal(false);
                }}
                className='bg-blue-600 text-white py-2 rounded hover:cursor-pointer hover:bg-blue-500 transition'>
                Google Calendar
              </button>
              <button
                onClick={() => setShowModal(false)}
                className='text-gray-600 underline hover:cursor-pointer text-sm mt-2'>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
