import { cn } from '@/utils/cn';

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className={cn('container mx-auto mt-8')}>
      {children}
    </main>
  );
}
