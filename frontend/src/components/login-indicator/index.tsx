import { AuthContext } from '@/context/auth';
import { cn } from '@dinners/components';
import { ComponentProps, FC, useContext } from 'react';

export const LoginIndicator: FC<ComponentProps<'div'>> = ({ className, ...props }) => {
  const { user, logIn, logOut } = useContext(AuthContext);
  return (
    <div className={cn('ml-auto', className)} {...props}>
      {user
        ? (
            <div onClick={logOut}>
              {JSON.stringify(user)}
            </div>
          )
        : (
            <button onClick={logIn}>Log in</button>
          )}
    </div>
  );
};
