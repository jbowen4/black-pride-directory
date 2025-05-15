import Image from 'next/image';

interface TeamMemberProps {
  name: string;
  role: string;
  description: string;
  imageSrc: string;
}

export function TeamMember({
  name,
  role,
  description,
  imageSrc,
}: TeamMemberProps) {
  return (
    <div className='flex flex-col items-center text-center'>
      <div className='relative w-40 h-40 rounded-full overflow-hidden mb-4'>
        <Image
          src={imageSrc || '/placeholder.svg'}
          alt={name}
          fill
          className='object-cover'
        />
      </div>
      <h3 className='text-xl font-bold'>{name}</h3>
      <p className='text-sm text-primary font-medium mb-2'>{role}</p>
      <p className='text-muted-foreground'>{description}</p>
    </div>
  );
}
