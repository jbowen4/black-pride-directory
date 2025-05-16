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
