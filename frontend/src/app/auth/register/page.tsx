import { getUser } from '@/context/auth/action/get';
import { cn } from '@/utils/cn';
import {
  Card,
  // CardAction,
  CardContent,
  // CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@dinners/components/card';
import { Link } from '@dinners/components/link';
import NextLink from 'next/link';
import { redirect } from 'next/navigation';

export default async function RegisterPage() {
  if (await getUser()) {
    return redirect('/');
  }

  return (
    <div className={cn('max-w-lg mx-auto')}>
      <Card className={cn('mx-4')}>
        <CardHeader>
          <CardTitle>Log in</CardTitle>
        </CardHeader>
        <CardContent>
          <p>todo</p>
        </CardContent>
        <CardFooter className="flex items-center justify-center">
          <Link asChild>
            <NextLink href="/auth/login">
              I already have an account
            </NextLink>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
