import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export const categories = [
  'Pride',
  'Parade',
  'Educational',
  'Social',
  'Spiritual',
  'Activism',
  'Professional/Networking',
  'Wellness',
  'Sex+/Body+',
  'Performance',
  'Festival',
  'Art',
  'Food',
  'Sports',
  'Other',
];

export const city_names = [
  { displayName: 'New York', dbName: 'New York' },
  { displayName: 'Los Angeles', dbName: 'Los Angeles' },
  { displayName: 'Chicago', dbName: 'Chicago' },
  { displayName: 'Houston', dbName: 'Houston' },
  { displayName: 'Philadelphia', dbName: 'Philadelphia' },
  { displayName: 'D.C.', dbName: 'Washington' },
  { displayName: 'Atlanta', dbName: 'Atlanta' },
  { displayName: 'Dallas', dbName: 'Dallas' },
  { displayName: 'Miami', dbName: 'Miami' },
  { displayName: 'Orlando', dbName: 'Orlando' },
  { displayName: 'San Francisco', dbName: 'San Francisco' },
];

export const formatDatetimeRange = (
  startDateString: string,
  startTimeString: string,
  endDateString: string,
  endTimeString: string
): { start: string; end: string } => {
  function parseDateTime(dateString: string, timeString: string): Date | null {
    try {
      const is12Hour = /[AP]M/i.test(timeString.trim());
      const time = is12Hour
        ? timeString.trim()
        : timeString.trim().padEnd(5, '0');

      if (dateString.includes('/')) {
        const parts = dateString.split('/');
        if (parts.length !== 3)
          throw new Error('Invalid MM/DD/YYYY date format');
        const [month, day, year] = parts;
        const paddedMonth = month.padStart(2, '0');
        const paddedDay = day.padStart(2, '0');
        const paddedYear = year.length === 2 ? '20' + year : year;
        const isoDate = `${paddedYear}-${paddedMonth}-${paddedDay}`;
        const fullTime = convertTo24Hour(time);
        return new Date(`${isoDate}T${fullTime}`);
      } else {
        const fullTime = convertTo24Hour(time);
        return new Date(`${dateString}T${fullTime}`);
      }
    } catch {
      return null;
    }
  }

  const startDate = parseDateTime(startDateString, startTimeString);

  let endDate: Date | null = null;

  if (endDateString && endDateString.trim()) {
    console.log(endDateString, endTimeString);
    endDate = parseDateTime(endDateString, endTimeString);
  } else {
    // No end date provided, infer based on time comparison
    const startTime24 = convertTo24Hour(startTimeString);
    const endTime24 = convertTo24Hour(endTimeString);

    // Compare times as "HH:MM:SS"
    if (endTime24 > startTime24) {
      // End time is after start time, same day
      endDate = parseDateTime(startDateString, endTimeString);
    } else {
      // End time is before or equal to start time, next day
      if (startDate) {
        const nextDay = new Date(startDate);
        nextDay.setDate(nextDay.getDate() + 1);
        // Format nextDay as YYYY-MM-DD
        const yyyy = nextDay.getFullYear();
        const mm = String(nextDay.getMonth() + 1).padStart(2, '0');
        const dd = String(nextDay.getDate()).padStart(2, '0');
        const nextDayStr = `${yyyy}-${mm}-${dd}`;
        endDate = parseDateTime(nextDayStr, endTimeString);
      }
    }
  }

  if (
    !startDate ||
    !endDate ||
    isNaN(startDate.getTime()) ||
    isNaN(endDate.getTime())
  ) {
    console.error('formatDatetimeRange error: Invalid start or end date');
    return { start: '', end: '' };
  }

  const toIsoCompact = (date: Date) =>
    date
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d+Z$/, 'Z');

  return {
    start: toIsoCompact(startDate),
    end: toIsoCompact(endDate),
  };
};

// Converts "4:00 PM" to "16:00:00" or leaves 24-hour time as-is
export const convertTo24Hour = (timeStr: string): string => {
  const time = timeStr.trim();

  if (/[AP]M/i.test(time)) {
    const [rawTime, modifier] = time.split(' ');
    const [rawHours, minutes] = rawTime.split(':').map(Number);
    let hours = rawHours;
    if (modifier.toLowerCase() === 'pm' && hours !== 12) hours += 12;
    if (modifier.toLowerCase() === 'am' && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
  }

  // Handle 24-hour format
  if (/^\d{1,2}:\d{2}$/.test(time)) {
    return `${time}:00`;
  }

  // Fallback to midnight
  return '00:00:00';
};

export function formatLocation(
  location_name: string,
  street_address: string,
  city: string,
  state: string,
  zipcode: string,
  country: string
): string {
  if (!street_address || !city || !state || !zipcode || !country) {
    return '';
  }
  const address = [street_address, city, `${state} ${zipcode}`, country]
    .filter(Boolean)
    .join(', ');
  return location_name && location_name.trim()
    ? `${location_name.trim()}, ${address}`
    : address;
}
