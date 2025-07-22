import { AuthContext } from '@/context/auth';
import { cn, Popover, PopoverContent, PopoverTrigger } from '@dinners/components';
import { ComponentProps, FC, useContext } from 'react';

export const LoginIndicator: FC<ComponentProps<'button'>> = ({ className, ...props }) => {
  const { user, logIn, logOut } = useContext(AuthContext);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className={cn('ms-auto flex flex-row items-center-safe justify-center-safe', className)} {...props}>
          {user ? user.username : 'Log in'}
        </button>
      </PopoverTrigger>
      <PopoverContent>
        {user
          ? (
              <pre onClick={logOut}>
                {JSON.stringify(user, null, 2)}
              </pre>
            )
          : (
              <button onClick={logIn}>Log in</button>
            )}
      </PopoverContent>
    </Popover>
  );
};
