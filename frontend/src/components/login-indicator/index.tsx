import { AuthContext } from '@/context/auth';
import { FC, useContext } from 'react';

export const LoginIndicator: FC = () => {
  const { user, logIn, logOut } = useContext(AuthContext);
  return user
    ? (
        <div onClick={logOut}>{JSON.stringify(user)}</div>
      )
    : (
        <button onClick={logIn}>Log in</button>
      );
};
