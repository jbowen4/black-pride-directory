import Link from 'next/link';
import Image from 'next/image';

// Define the city data
const cities = [
  {
    name: 'New York',
    image: '/placeholder.svg?height=300&width=400',
    slug: 'new-york',
  },
  {
    name: 'Los Angeles',
    image: '/placeholder.svg?height=300&width=400',
    slug: 'los-angeles',
  },
  {
    name: 'Chicago',
    image: '/placeholder.svg?height=300&width=400',
    slug: 'chicago',
  },
  {
    name: 'Atlanta',
    image: '/placeholder.svg?height=300&width=400',
    slug: 'atlanta',
  },
  {
    name: 'Miami',
    image: '/placeholder.svg?height=300&width=400',
    slug: 'miami',
  },
  {
    name: 'San Francisco',
    image: '/placeholder.svg?height=300&width=400',
    slug: 'san-francisco',
  },
];

export function PopularCities() {
  return (
    <section className='bg-gray-50 py-16 rounded-2xl'>
      <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <h2 className='text-3xl font-bold text-center mb-12'>Popular Cities</h2>

        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
          {cities.map((city) => (
            <Link
              key={city.slug}
              href={`/events?city=${city.slug}`}
              className='group block'>
              <div className='relative h-64 rounded-xl overflow-hidden transition-transform duration-300 group-hover:scale-[1.02] group-hover:shadow-lg'>
                {/* Background image */}
                <Image
                  src={city.image || '/placeholder.svg'}
                  alt={`${city.name} city`}
                  fill
                  className='object-cover'
                />

                {/* Gradient overlay to ensure text visibility */}
                <div className='absolute inset-0 bg-gradient-to-t from-black/70 to-black/20' />

                {/* City name */}
                <div className='absolute inset-0 flex items-center justify-center'>
                  <h3 className='text-2xl font-bold text-white'>{city.name}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
