import React from 'react';
import { cn } from '@/lib/utils';

export const SkipLinks = ({ className, ...props }) => {
  const skipLinks = [
    { href: '#main-content', label: 'Pular para o conteúdo principal' },
    { href: '#navigation', label: 'Pular para a navegação' },
    { href: '#sidebar', label: 'Pular para a barra lateral' }
  ];

  return (
    <div className={cn('sr-only focus-within:not-sr-only', className)} {...props}>
      {skipLinks.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className={cn(
            'absolute top-4 left-4 z-50',
            'bg-orange-600 text-white px-4 py-2 rounded-md',
            'font-medium text-sm',
            'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2',
            'transition-all duration-200'
          )}
        >
          {link.label}
        </a>
      ))}
    </div>
  );
};

