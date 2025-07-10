'use client';

import { FC } from 'react';
import { cn } from '@dinners/components';
import { Home } from 'lucide-react';

export const MobileNavbar: FC = () => {
  return (
    <div className={cn('w-full py-4 border absolute bottom-0 md:hidden flex')}>
      <button>
        <Home />
      </button>
    </div>
  );
};
