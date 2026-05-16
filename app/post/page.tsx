import EventForm from '@/components/event-form';
import { CollectionType, fetchAll } from '@/lib/fetch';

export default async function PostPage() {
  const categories = await fetchAll(CollectionType.Category);
  const organizers = await fetchAll(CollectionType.Organizer);
  const sponsors = await fetchAll(CollectionType.Sponsor);

  organizers.push({ id: Number.MAX_SAFE_INTEGER, name: 'Other' });

  return (
    <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12'>
      <EventForm
        categories={categories}
        organizers={organizers}
        sponsors={sponsors}
        //postFn={postOne}
      />
    </div>
  );
}
