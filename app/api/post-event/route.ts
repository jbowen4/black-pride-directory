import { CollectionType, postOne } from '@/lib/fetch';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { data } = await request.json();

    console.log(data);

    // Optionally: validate `data` shape here before posting

    const created = await postOne(CollectionType.Event, data);

    if (!created) {
      console.log('ERRORRRORRORRR');
      return NextResponse.json(
        { valid: false, error: 'Failed to create event' },
        { status: 500 }
      );
    }

    return NextResponse.json({ valid: true, data: created });
  } catch (error) {
    console.error('Error in POST /api/events:', error);
    return NextResponse.json(
      { valid: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}
