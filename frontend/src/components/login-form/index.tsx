'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
} from '@dinners/components/form';
import { z } from 'zod';
import { Button } from '@dinners/components/button';
import { Input } from '@dinners/components/input';
import { cn } from '@/utils/cn';
import { use } from 'react';
import { AuthContext } from '@/context/auth';
import { IncorrectPasswordError, UnknownUserError } from '@/lib/api/login/errors';

const formSchema = z.object({
  username: z.string().min(5),
  password: z.string().min(8, {
    message: 'Password must be at least 8 characters.',
  }),
});

type LoginFormValues = z.infer<typeof formSchema>;

interface Props {
  successfulLogin: () => void;
}

export function LoginForm({ successfulLogin }: Props) {
  const { logIn } = use(AuthContext);
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  function onSubmit(values: LoginFormValues) {
    logIn(values.username, values.password)
      .then(() => {
        successfulLogin();
      })
      .catch((e) => {
        form.resetField('password');

        if (e instanceof IncorrectPasswordError) {
          form.setError('password', { type: e.code.toString(), message: e.message });
        } else if (e instanceof UnknownUserError) {
          form.setError('username', { type: e.code.toString(), message: e.message });
        } else {
          form.setError('root', {
            type: '500',
            message: 'Something went wrong, try logging in again later.',
          });
        }
      });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input
                  placeholder="dinnersenjoyer"
                  autoComplete="username"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="current-password"
                  placeholder="********"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {form.formState.errors.root && (
          <FormMessage>{form.formState.errors.root.message}</FormMessage>
        )}
        <Button className={cn('w-full')} type="submit">Submit</Button>
      </form>
    </Form>
  );
}
