'use client';

import { FC } from 'react';
import { cn } from '@dinners/components';
import { Home } from 'lucide-react';

export const MobileNavbar: FC = () => {
  return (
    <div className={cn('w-full absolute bottom-0 hidden max-lg:flex')}>
      <button>
        <Home />
      </button>
    </div>
  );
};
