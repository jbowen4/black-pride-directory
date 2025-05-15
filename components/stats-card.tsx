interface StatsCardProps {
  number: number;
  label: string;
}

export function StatsCard({ number, label }: StatsCardProps) {
  return (
    <div className='flex flex-col items-center'>
      <span className='text-5xl font-bold mb-2'>{number}</span>
      <span className='text-muted-foreground'>{label}</span>
    </div>
  );
}
