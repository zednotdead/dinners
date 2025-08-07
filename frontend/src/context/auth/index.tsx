'use client';

import { createContext, FC, PropsWithChildren, useState } from 'react';
import { logIn as logInAction } from './action/login';
import { logOut as logOutAction } from './action/logout';
import { redirect } from 'next/navigation';
import logger from '@/lib/logger';
import { faro } from '@grafana/faro-web-sdk';
import { IncorrectPasswordError, UnknownLoginError, UnknownUserError } from '@/lib/api/login/errors';
import { components } from '@/lib/api/v1';

export type User = components['schemas']['User'];

interface AuthContextValue {
  user?: User;
  logIn: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue>({
  logIn: async () => { /* noop */ },
  logOut: async () => { /* noop */ },
});

interface AuthContextProviderProps { initialUser?: User }

export const AuthContextProvider: FC<PropsWithChildren<AuthContextProviderProps>> = ({ initialUser, children }) => {
  const [user, setUser] = useState<User | undefined>(initialUser);

  function logIn(email: string, password: string) {
    const { trace, context } = faro.api.getOTEL()!;

    const tracer = trace.getTracer('default');
    const span = tracer.startSpan('click');

    return context.with(trace.setSpan(context.active(), span), async () => {
      logger.info('Logging user in');

      const res = await logInAction(email, password);

      if (res.error && !res.user) {
        switch (res.code) {
          case IncorrectPasswordError.code:
            throw new IncorrectPasswordError();
          case UnknownUserError.code:
            throw new UnknownUserError();
          default:
            throw new UnknownLoginError();
        }
      } else {
        setUser(res.user);
      }
      return;
    });
  }

  async function logOut() {
    const didLogOut = await logOutAction();
    if (didLogOut) {
      setUser(undefined);
      redirect('/');
    };
  }

  return (
    <AuthContext.Provider value={{ user, logIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};
