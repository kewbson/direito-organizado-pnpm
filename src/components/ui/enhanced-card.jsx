import React from 'react';
import { cn } from '@/lib/utils';

const cardVariants = {
  variant: {
    default: 'card-base',
    gradient: 'card-gradient',
    bordered: 'border-2 border-orange-200 bg-white',
    elevated: 'shadow-lg bg-white border border-slate-200'
  },
  hover: {
    none: '',
    lift: 'hover:shadow-lg hover:-translate-y-1',
    glow: 'hover:shadow-orange-200/50 hover:shadow-xl',
    scale: 'hover:scale-105'
  }
};

const EnhancedCard = React.forwardRef(({
  className,
  variant = 'default',
  hover = 'lift',
  children,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-lg transition-all duration-300 ease-in-out',
        cardVariants.variant[variant],
        cardVariants.hover[hover],
        'animate-fade-in',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

EnhancedCard.displayName = 'EnhancedCard';

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-2xl font-semibold leading-none tracking-tight',
      'text-slate-900 dark:text-slate-100',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-slate-500 dark:text-slate-400', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export {
  EnhancedCard,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
};

