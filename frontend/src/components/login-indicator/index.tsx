import { AuthContext } from '@/context/auth';
import { Button, cn, Popover, PopoverContent, PopoverTrigger } from '@dinners/components';
import { ComponentProps, FC, useContext } from 'react';
import { UserAvatar } from './user-avatar';
import Link from 'next/link';

export const LoginIndicator: FC<ComponentProps<'button'>> = ({ className, ...props }) => {
  const { user, logIn, logOut } = useContext(AuthContext);
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
                <Button onClick={logIn}>Log in</Button>
                <Button variant="secondary">Register</Button>
              </>
            )}
      </PopoverContent>
    </Popover>
  );
};
