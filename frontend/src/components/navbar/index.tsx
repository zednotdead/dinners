// 'use client';

import { FC } from 'react';
import { DesktopNavbar } from './desktop';
import { MobileNavbar } from './mobile';

export const Navbar: FC = () => {
  return (
    <>
      <DesktopNavbar />
      <MobileNavbar />
    </>
  );
};
