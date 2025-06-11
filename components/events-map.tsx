'use client';

import { useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { EventMetadata } from '@/lib/events';

function geocodeAddress(
  address: string
): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    const geocoder = new google.maps.Geocoder();

    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        resolve({ lat: location.lat(), lng: location.lng() });
      } else {
        reject(`Geocode failed: ${status}`);
      }
    });
  });
}

export default function EventsMap({ events }: { events: EventMetadata[] }) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
      version: 'weekly',
    });

    loader.load().then(async () => {
      if (!mapRef.current) return;

      const mapOptions: google.maps.MapOptions = {
        center: { lat: 39.8283, lng: -98.5795 }, // Geographic center of continental US
        zoom: 4, // Broad view to show the entire US
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      };

      const map = new google.maps.Map(mapRef.current, mapOptions);

      events.forEach(async (event) => {
        const address = `${event.street_address}, ${event.city}, ${event.state}, ${event.zip_code}, ${event.country}`;
        try {
          const { lat, lng } = await geocodeAddress(address);
          const marker = new google.maps.Marker({
            position: { lat, lng },
            map,
            title: event.event_name,
          });

          const infoWindow = new google.maps.InfoWindow({
            content: `
        <div>
          <strong>${event.event_name}</strong><br/>
          ${event.start_date ? `<span>${event.start_date}</span><br/>` : ''}
          ${event.location_name ? `<span>${event.location_name}</span>` : ''}
        </div>
          `,
          });

          marker.addListener('mouseover', () => {
            infoWindow.open(map, marker);
          });

          marker.addListener('mouseout', () => {
            infoWindow.close();
          });
        } catch (error) {
          console.error(`Failed to geocode address "${address}":`, error);
          return; // Skip this event if geocoding fails
        }
      });
    });
  }, []);

  return <div ref={mapRef} className='w-full h-[400px] rounded shadow' />;
}
