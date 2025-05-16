import { getCities } from '@/lib/cities';
import { getEvents } from '@/lib/events';
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const events = await getEvents();
  const eventSlugs = events.map((event) => ({ slug: event.slug }));

  const cities = await getCities();
  const citySlugs = cities.map((city) => ({ slug: city.slug }));

  const eventUrls = eventSlugs.map((event) => ({
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/events/${event.slug}`,
  }));

  const cityUrls = citySlugs.map((city) => ({
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/cities/${city.slug}`,
  }));

  return [
    {
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
    },
    {
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/about`,
    },
    {
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/events`,
    },
    ...eventUrls,
    ...cityUrls,
  ];
}
