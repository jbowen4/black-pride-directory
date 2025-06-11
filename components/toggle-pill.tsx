'use client';

import { Calendar, List, Map } from 'lucide-react';
import { motion } from 'framer-motion';

export type ToggleOption = 'list' | 'calendar' | 'map';

export default function TogglePill({
  value,
  onChange,
}: {
  value: ToggleOption;
  onChange: (val: ToggleOption) => void;
}) {
  const options = [
    { value: 'list' as ToggleOption, icon: List },
    { value: 'calendar' as ToggleOption, icon: Calendar },
    { value: 'map' as ToggleOption, icon: Map },
  ];

  return (
    <div className='flex justify-center'>
      <div className='relative flex items-center bg-white border border-input rounded-full p-1 shadow-sm'>
        {options.map((option, index) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full transition-colors hover:cursor-pointer ${
              value === option.value
                ? 'text-gray-800'
                : 'text-gray-400 hover:text-gray-600'
            }`}
            aria-pressed={value === option.value}
            aria-label={`${option.value} view`}>
            <option.icon className='w-5 h-5' />
          </button>
        ))}

        {/* Animated selection indicator */}
        <motion.div
          className='absolute z-0 w-12 h-12 bg-gray-100 rounded-full border border-input'
          initial={false}
          animate={{
            x: options.findIndex((opt) => opt.value === value) * 48,
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
            duration: 0.3,
          }}
        />
      </div>
    </div>
  );
}
