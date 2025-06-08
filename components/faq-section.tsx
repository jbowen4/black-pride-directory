'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export function FaqSection() {
  const faqs = [
    {
      question: 'What is Black Pride Directory?',
      answer:
        'Black Pride Directory is a platform dedicated to connecting the Black LGBTQ+ community through events, resources, and community building across the United States.',
    },
    {
      question: 'How can I add my event to the platform?',
      answer:
        'Event organizers can submit their events through our submission form. After a brief review process to ensure it aligns with our community guidelines, your event will be listed on our platform.',
    },
    {
      question: 'Is Black Pride Directory only for certain cities?',
      answer:
        "While we currently feature events in 10 major cities, we're constantly expanding our reach. Our goal is to include events from communities of all sizes across the country.",
    },
    {
      question: 'How can I get involved with Black Pride Directory?',
      answer:
        'There are many ways to get involved! You can volunteer, become a community ambassador, partner with us as an organization, or simply spread the word about our platform.',
    },
    {
      question: 'Do you offer sponsorships for events?',
      answer:
        'We have limited sponsorship opportunities available for events that align strongly with our mission. Please contact us directly to discuss potential sponsorship options.',
    },
  ];

  return (
    <Accordion type='single' collapsible className='w-full'>
      {faqs.map((faq, index) => (
        <AccordionItem key={index} value={`item-${index}`}>
          <AccordionTrigger className='text-left'>
            {faq.question}
          </AccordionTrigger>
          <AccordionContent>{faq.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
