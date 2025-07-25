'use client';

import { FC } from 'react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
  cn,
} from '@dinners/components';
import Link from 'next/link';
import { LoginIndicator } from '../login-indicator';

export const DesktopNavbar: FC = () => {
  return (
    <div className={cn('border-b sticky top-0 hidden lg:block')}>
      <div className={cn('container mx-auto py-4 px-4 hidden lg:flex')}>
        <NavigationMenu viewport={false}>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle())}>
                <Link href="/">Home</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Item One</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink>Link</NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <LoginIndicator />
      </div>
    </div>
  );
};
