import { User as UserType } from '@/context/auth';
import { cn } from '@/utils/cn';
import { Avatar, AvatarFallback, AvatarImage } from '@dinners/components/avatar';
import { User } from 'lucide-react';
import { FC } from 'react';

interface Props {
  user?: UserType;
  className?: string;
  fallbackClassName?: string;
}

export const UserAvatar: FC<Props> = ({ user, fallbackClassName, className }) => {
  const firstLetter = user?.username.at(0)?.toLocaleLowerCase();
  const avatar = user?.avatar ? `http://localhost:9000/auth/${user.avatar}` : undefined;

  return (
    <Avatar className={className}>
      <AvatarFallback className={cn('text-secondary-foreground', fallbackClassName)}>
        {firstLetter ? firstLetter : <User />}
      </AvatarFallback>
      <AvatarImage src={avatar} />
    </Avatar>
  );
};
