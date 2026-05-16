'use client';

import type React from 'react';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Calendar, MapPin, Users, DollarSign, Globe } from 'lucide-react';
import Image from 'next/image';
import { Category, Organizer, Sponsor } from '@/lib/collections';

const timeZones = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
];

const countries = [
  'United States',
  'Canada',
  'United Kingdom',
  'Germany',
  'France',
  'Australia',
  'Japan',
  'Other',
];

const states = [
  'Alabama',
  'Alaska',
  'Arizona',
  'Arkansas',
  'California',
  'Colorado',
  'Connecticut',
  'Delaware',
  'Florida',
  'Georgia',
  'Hawaii',
  'Idaho',
  'Illinois',
  'Indiana',
  'Iowa',
  'Kansas',
  'Kentucky',
  'Louisiana',
  'Maine',
  'Maryland',
  'Massachusetts',
  'Michigan',
  'Minnesota',
  'Mississippi',
  'Missouri',
  'Montana',
  'Nebraska',
  'Nevada',
  'New Hampshire',
  'New Jersey',
  'New Mexico',
  'New York',
  'North Carolina',
  'North Dakota',
  'Ohio',
  'Oklahoma',
  'Oregon',
  'Pennsylvania',
  'Rhode Island',
  'South Carolina',
  'South Dakota',
  'Tennessee',
  'Texas',
  'Utah',
  'Vermont',
  'Virginia',
  'Washington',
  'West Virginia',
  'Wisconsin',
  'Wyoming',
];

export default function EventForm({
  categories,
  organizers,
  sponsors,
  //postFn,
}: {
  categories: Category[];
  organizers: Organizer[];
  sponsors: Sponsor[];
  // postFn: <T extends CollectionType>(
  //   collection: T,
  //   data: CollectionTypeMap[T][]
  // ) => Promise<any>;
}) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedOrganizers, setSelectedOrganizers] = useState<string[]>([]);
  const [selectedSponsors, setSelectedSponsors] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [rsvpRequired, setRsvpRequired] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addToSelection = (
    value: string,
    currentSelection: string[],
    setSelection: (items: string[]) => void
  ) => {
    if (!currentSelection.includes(value)) {
      setSelection([...currentSelection, value]);
    }
  };

  const removeFromSelection = (
    value: string,
    currentSelection: string[],
    setSelection: (items: string[]) => void
  ) => {
    console.log('herererereljrkeljwrjeklrjekljrkeljre');
    console.log(value);
    console.log(currentSelection);

    setSelection(currentSelection.filter((item) => item !== value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('Submitting form...');
    e.preventDefault();
    setPasswordError(null);

    const formData = new FormData(e.target as HTMLFormElement);
    const submissionPassword = formData.get('submission_password');

    console.log('Submission Password:', submissionPassword);

    if (
      submissionPassword !== process.env.NEXT_PUBLIC_EVENT_SUBMISSION_PASSWORD
    ) {
      setPasswordError('Invalid submission password. Please try again.');
      return;
    }

    const data: Record<string, unknown> = {};
    formData.forEach((value, key) => {
      if (data[key]) {
        // handle multiple values (e.g., checkboxes)
        if (Array.isArray(data[key])) {
          data[key].push(value);
        } else {
          data[key] = [data[key], value];
        }
      } else {
        data[key] = value;
      }
    });

    if (data.price === '') {
      data.price = 0;
    }

    // 🔴 Remove password from the final submission payload
    delete data.submission_password;
    delete data.documentId;

    // Add controlled selections
    // data.categories = selectedCategories
    //   .map((id) => categories.find((c) => c.id.toString() === id))
    //   .filter(Boolean);
    // data.organizers = selectedOrganizers
    //   .map((id) => organizers.find((o) => o.id.toString() === id))
    //   .filter(Boolean);
    // data.sponsors = selectedSponsors
    //   .map((id) => sponsors.find((s) => s.id.toString() === id))
    //   .filter(Boolean);
    data.categories = selectedCategories
      .map((id) => ({ id: Number(id) }))
      .filter(Boolean);
    data.organizers = selectedOrganizers
      .map((id) => ({ id: Number(id) }))
      .filter(Boolean);
    data.sponsors = selectedSponsors
      .map((id) => ({ id: Number(id) }))
      .filter(Boolean);
    data.rsvp_required = rsvpRequired;

    console.log(data);

    try {
      const response = await fetch('/api/post-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
      });

      await response.json();
    } catch (error) {
      console.log('Error submitting form:', error);
      //setError('An error occurred while submitting the form.');
    }

    console.log('Form submitted');

    clearForm();
  };

  const clearForm = () => {
    window.location.reload();
  };

  return (
    <div className='max-w-4xl mx-auto p-6 space-y-8'>
      <div className='text-center space-y-2'>
        <h1 className='text-3xl font-bold'>Submit New Event</h1>
        <p className='text-muted-foreground'>
          Fill out the form below to create a new event listing
        </p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-8'>
        {/* Basic Event Information */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Calendar className='h-5 w-5' />
              Event Information
            </CardTitle>
            <CardDescription>Basic details about your event</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='event_name'>Event Name *</Label>
              <Input
                id='event_name'
                name='event_name'
                placeholder='Enter event name'
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='description'>Description</Label>
              <Textarea
                id='description'
                name='description'
                placeholder='Describe your event...'
                className='min-h-[100px]'
              />
            </div>

            <div className='space-y-2 flex flex-col md:flex-row items-stretch md:items-start gap-4'>
              {/* Organizers */}
              <div className='space-y-3 flex-1'>
                <Label>Organizer(s)</Label>
                <Select
                  value=''
                  onValueChange={(value) => {
                    addToSelection(
                      value,
                      selectedOrganizers,
                      setSelectedOrganizers
                    );
                  }}>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Select organizers' />
                  </SelectTrigger>
                  <SelectContent>
                    {organizers
                      .filter(
                        (org) => !selectedOrganizers.includes(org.id.toString())
                      )
                      .map((organizer) => (
                        <SelectItem
                          key={organizer.id}
                          value={organizer.id.toString()}>
                          {organizer.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <div className='flex flex-wrap gap-2'>
                  {selectedOrganizers.map((organizerId) => {
                    const organizer = organizers.find(
                      (o) => o.id.toString() === organizerId
                    );
                    return (
                      <Badge
                        key={organizerId}
                        variant='secondary'
                        className='flex items-center gap-1'>
                        {organizer?.name}
                        <button
                          type='button'
                          className='ml-1 hover:bg-gray-200 rounded-full p-0.5 hover:cursor-pointer'
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeFromSelection(
                              organizerId,
                              selectedOrganizers,
                              setSelectedOrganizers
                            );
                          }}>
                          <X className='h-3 w-3' />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              </div>
              {selectedOrganizers.includes(
                Number.MAX_SAFE_INTEGER.toString()
              ) && (
                <div className='space-y-3 flex-1'>
                  <Label htmlFor='organizer_string'>
                    If the Organizer Name is not listed, write it here
                  </Label>
                  <Input
                    id='organizer_string'
                    name='organizer_string'
                    placeholder='Event organizer name'
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Location Information */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <MapPin className='h-5 w-5' />
              Location Details
            </CardTitle>
            <CardDescription>Where will your event take place?</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='location_name'>Location Name</Label>
              <Input
                id='location_name'
                name='location_name'
                placeholder='Venue or location name'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='street_address'>Street Address</Label>
              <Input
                id='street_address'
                name='street_address'
                placeholder='123 Main Street'
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='city_name'>City</Label>
                <Input
                  id='city_name'
                  name='city_name'
                  placeholder='City name'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='state'>State</Label>
                <Select name='state'>
                  <SelectTrigger>
                    <SelectValue placeholder='Select state' />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='zipcode'>ZIP Code</Label>
                <Input id='zipcode' name='zipcode' placeholder='12345' />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='country'>Country</Label>
              <Select name='country'>
                <SelectTrigger>
                  <SelectValue placeholder='Select country' />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Date and Time */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Calendar className='h-5 w-5' />
              Date & Time
            </CardTitle>
            <CardDescription>When will your event happen?</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='start_datetime'>Start Date & Time *</Label>
                <Input
                  id='start_datetime'
                  name='start_datetime'
                  type='datetime-local'
                  required
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='end_datetime'>End Date & Time *</Label>
                <Input
                  id='end_datetime'
                  name='end_datetime'
                  type='datetime-local'
                  required
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='time_zone'>Time Zone</Label>
              <Select name='time_zone'>
                <SelectTrigger>
                  <SelectValue placeholder='Select time zone' />
                </SelectTrigger>
                <SelectContent>
                  {timeZones.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Event Details */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <DollarSign className='h-5 w-5' />
              Event Details
            </CardTitle>
            <CardDescription>Additional event information</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='price'>Price ($)</Label>
              <Input
                id='price'
                name='price'
                type='number'
                min='0'
                step='0.01'
                placeholder='0.00'
              />
            </div>

            <div className='flex items-center space-x-2'>
              <Checkbox
                id='rsvp_required'
                name='rsvp_required'
                checked={rsvpRequired}
                onCheckedChange={(checked) =>
                  setRsvpRequired(checked as boolean)
                }
              />
              <Label htmlFor='rsvp_required'>RSVP Required</Label>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='image'>Event Image</Label>
              <div className='space-y-2'>
                <Input
                  id='image'
                  name='image'
                  type='file'
                  accept='image/*'
                  onChange={handleImageChange}
                />
                {imagePreview && (
                  <div className='relative w-full max-w-md'>
                    <Image
                      src={imagePreview || '/placeholder.svg'}
                      alt='Event preview'
                      width={800}
                      height={192}
                      unoptimized
                      className='w-full h-48 object-cover rounded-lg border'
                    />
                    <Button
                      type='button'
                      variant='destructive'
                      size='sm'
                      className='absolute top-2 right-2'
                      onClick={() => setImagePreview(null)}>
                      <X className='h-4 w-4' />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social & Web */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Globe className='h-5 w-5' />
              Social & Web
            </CardTitle>
            <CardDescription>Online presence for your event</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='website'>Website</Label>
              <Input
                id='website'
                name='website'
                type='url'
                placeholder='https://example.com'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='instagram'>Instagram</Label>
              <Input id='instagram' name='instagram' placeholder='@username' />
            </div>
          </CardContent>
        </Card>

        {/* Relations */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Users className='h-5 w-5' />
              Categories & Associations
            </CardTitle>
            <CardDescription>
              Select relevant categories and sponsors
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            {/* Categories */}
            <div className='space-y-3'>
              <Label>Categories</Label>
              <Select
                value=''
                onValueChange={(value) => {
                  addToSelection(
                    value,
                    selectedCategories,
                    setSelectedCategories
                  );
                }}>
                <SelectTrigger>
                  <SelectValue placeholder='Select categories' />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .filter(
                      (cat) => !selectedCategories.includes(cat.id.toString())
                    )
                    .map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <div className='flex flex-wrap gap-2'>
                {selectedCategories.map((categoryId) => {
                  const category = categories.find(
                    (c) => c.id.toString() === categoryId
                  );
                  return (
                    <Badge
                      key={categoryId}
                      variant='secondary'
                      className='flex items-center gap-1'>
                      {category?.name}
                      <button
                        type='button'
                        className='ml-1 hover:bg-gray-200 rounded-full p-0.5 hover:cursor-pointer'
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeFromSelection(
                            categoryId,
                            selectedCategories,
                            setSelectedCategories
                          );
                        }}>
                        <X className='h-3 w-3' />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            </div>

            {/* Sponsors */}
            <div className='space-y-3'>
              <Label>Sponsors</Label>
              <Select
                value=''
                onValueChange={(value) => {
                  addToSelection(value, selectedSponsors, setSelectedSponsors);
                }}>
                <SelectTrigger>
                  <SelectValue placeholder='Select sponsors' />
                </SelectTrigger>
                <SelectContent>
                  {sponsors
                    .filter(
                      (sponsor) =>
                        !selectedSponsors.includes(sponsor.id.toString())
                    )
                    .map((sponsor) => (
                      <SelectItem
                        key={sponsor.id}
                        value={sponsor.id.toString()}>
                        {sponsor.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <div className='flex flex-wrap gap-2'>
                {selectedSponsors.map((sponsorId) => {
                  const sponsor = sponsors.find(
                    (s) => s.id.toString() === sponsorId
                  );
                  return (
                    <Badge
                      key={sponsorId}
                      variant='secondary'
                      className='flex items-center gap-1'>
                      {sponsor?.name}
                      <button
                        type='button'
                        className='ml-1 hover:bg-gray-200 rounded-full p-0.5 hover:cursor-pointer'
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeFromSelection(
                            sponsorId,
                            selectedSponsors,
                            setSelectedSponsors
                          );
                        }}>
                        <X className='h-3 w-3' />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Event Submission Credential */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Users className='h-5 w-5' />
              Event Submission Credential
            </CardTitle>
            <CardDescription>
              Enter the password provided to authorized event uploaders. This
              credential is required to submit events to our platform.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='submission_password'>Submission Password *</Label>
              <Input
                id='submission_password'
                name='submission_password'
                type='password'
                placeholder='Enter your submission password'
                required
              />
              {passwordError && (
                <div className='flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md'>
                  <X className='h-4 w-4 text-red-500 flex-shrink-0' />
                  <p className='text-sm text-red-700'>{passwordError}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>



        {/* Submit Button */}
        <div className='flex justify-end space-x-4'>
          {/* <Button type='button' variant='outline'>
            Save as Draft
          </Button> */}
          <Button
            className='hover:cursor-pointer'
            variant='outline'
            onClick={(e) => {
              e.preventDefault();
              clearForm();
            }}>
            Clear Form
          </Button>
          <Button type='submit' className='hover:cursor-pointer'>
            Submit Event
          </Button>
        </div>
        <p>
          <b>Note:</b> The event will need to undergo a review process which
          could take a couple days, so do not expect to see it on the site
          immediately.
        </p>
      </form>
    </div>
  );
}
