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
  'Sex',
  'LGBTQ+',
  'Sexual Health',
  'Sexual Wellness',
  'Lesbian',
  'Education',
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
];

export const formatDatetime = (
  dateString: string,
  timeString: string
): string => {
  let date: Date;

  try {
    const is12Hour = /[AP]M/i.test(timeString.trim());
    const time = is12Hour
      ? timeString.trim()
      : timeString.trim().padEnd(5, '0');

    // Handle MM/DD/YYYY format
    if (dateString.includes('/')) {
      const parts = dateString.split('/');
      if (parts.length !== 3) throw new Error('Invalid MM/DD/YYYY date format');

      const [month, day, year] = parts;
      if (!month || !day || !year) throw new Error('Missing month/day/year');

      const paddedMonth = month.padStart(2, '0');
      const paddedDay = day.padStart(2, '0');
      const paddedYear = year.length === 2 ? '20' + year : year;

      const isoDate = `${paddedYear}-${paddedMonth}-${paddedDay}`;
      const fullTime = convertTo24Hour(time);
      date = new Date(`${isoDate}T${fullTime}`);
    } else {
      // Assume YYYY-MM-DD format
      const fullTime = convertTo24Hour(time);
      date = new Date(`${dateString}T${fullTime}`);
    }

    if (isNaN(date.getTime())) throw new Error('Parsed date is invalid');
  } catch (err) {
    console.error('formatDate error:', err);
    return ''; // fallback value
  }

  // Convert to ISO format (e.g. "20250628T160000Z")
  return date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d+Z$/, 'Z');
};

// Converts "4:00 PM" to "16:00:00" or leaves 24-hour time as-is
export const convertTo24Hour = (timeStr: string): string => {
  const time = timeStr.trim();

  if (/[AP]M/i.test(time)) {
    const [rawTime, modifier] = time.split(' ');
    let [hours, minutes] = rawTime.split(':').map(Number);
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
    throw new Error(
      'All address fields (street_address, city, state, zipcode, country) are required.'
    );
  }
  const address = [street_address, city, `${state} ${zipcode}`, country]
    .filter(Boolean)
    .join(', ');
  return location_name && location_name.trim()
    ? `${location_name.trim()}, ${address}`
    : address;
}
