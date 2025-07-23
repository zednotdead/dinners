'use client';

import { createContext, FC, PropsWithChildren, useState } from 'react';
import { logIn as logInAction } from './action/login';
import { logOut as logOutAction } from './action/logout';
import { redirect } from 'next/navigation';
import logger from '@/lib/logger';

export interface User {
  id: string;
  username: string;
  avatar?: string;
}

interface AuthContextValue {
  user?: User;
  logIn: () => void;
  logOut: () => void;
}

export const AuthContext = createContext<AuthContextValue>({
  logIn: () => { /* noop */ },
  logOut: () => { /* noop */ },
});

interface AuthContextProviderProps { initialUser?: User }

export const AuthContextProvider: FC<PropsWithChildren<AuthContextProviderProps>> = ({ initialUser, children }) => {
  const [user, setUser] = useState<User | undefined>(initialUser);

  function logIn() {
    logger.info('Logging user in');
    logInAction()
      .then((user) => setUser(user));
  }

  function logOut() {
    logOutAction()
      .then((didLogOut) => {
        if (didLogOut) {
          setUser(undefined);
          redirect('/');
        };
      });
  }

  return (
    <AuthContext.Provider value={{ user, logIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};
