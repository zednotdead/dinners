'use client';

import { AuthContext } from '@/context/auth';
import { ComponentProps, FC, use } from 'react';
import { UserAvatar } from './user-avatar';
import Link from 'next/link';
import { cn } from '@/utils/cn';
import { Popover, PopoverTrigger, PopoverContent } from '@dinners/components/popover';
import { Button } from '@dinners/components/button';

export const LoginIndicator: FC<ComponentProps<'button'>> = ({ className, ...props }) => {
  const { user, logOut } = use(AuthContext);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary" className={cn('text-md ms-auto h-fit w-fit p-2 rounded-full', className)} {...props}>
          <UserAvatar fallbackClassName="bg-transparent" user={user} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn('flex flex-col items-stretch space-y-2 m-2')}>
        {user
          ? (
              <>
                <Button asChild variant="ghost" className={cn('h-fit flex justify-start space-x-2')}>
                  <Link href={`/user/${user.id}`}>
                    <UserAvatar user={user} />
                    <div className="text-md font-semibold">{user.username}</div>
                  </Link>
                </Button>
                <Button onClick={logOut}>Log out</Button>
              </>
            )
          : (
              <>
                <Button asChild>
                  <Link href="/auth/login">Log in</Link>
                </Button>
                <Button variant="secondary">
                  <Link href="/auth/register">Register</Link>
                </Button>
              </>
            )}
      </PopoverContent>
    </Popover>
  );
};
