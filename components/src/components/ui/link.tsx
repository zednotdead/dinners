import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import type { ComponentProps } from 'react';

function Link({
  className,
  asChild = false,
  ...props
}: ComponentProps<'a'> & {
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot : 'a';

  return (
    <Comp
      data-slot="link"
      className={cn('text-primary hover:text-primary/80 active:text-primary/70 \
                    underline decoration-wavy decoration-primary', className)}
      {...props}
    />
  );
}

export { Link };
