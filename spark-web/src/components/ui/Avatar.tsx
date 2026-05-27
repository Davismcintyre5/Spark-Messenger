import React from 'react';
import { clsx } from 'clsx';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'away';
  className?: string;
}

const sizeMap = {
  xs: 'w-7 h-7 text-xs',
  sm: 'w-9 h-9 text-sm',
  md: 'w-12 h-12 text-base',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-20 h-20 text-2xl',
};

const statusSize = { xs: 'w-2 h-2', sm: 'w-2.5 h-2.5', md: 'w-3 h-3', lg: 'w-3.5 h-3.5', xl: 'w-4 h-4' };
const statusColor = { online: 'bg-green-500', offline: 'bg-gray-400', away: 'bg-yellow-500' };

export default function Avatar({ src, name, size = 'md', status, className }: AvatarProps) {
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '';

  return (
    <div className={clsx('relative inline-flex shrink-0', className)}>
      {src ? (
        <img
          src={src}
          alt={name || 'Avatar'}
          className={clsx('rounded-full object-cover', sizeMap[size])}
        />
      ) : (
        <div
          className={clsx(
            'rounded-full bg-spark-100 dark:bg-spark-900 text-spark-600 dark:text-spark-400 flex items-center justify-center font-medium',
            sizeMap[size],
          )}
        >
          {initials || <User className="w-1/2 h-1/2" />}
        </div>
      )}
      {status && (
        <span
          className={clsx(
            'absolute bottom-0 right-0 rounded-full ring-2 ring-white dark:ring-gray-950',
            statusSize[size],
            statusColor[status],
          )}
        />
      )}
    </div>
  );
}