import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

// Skeleton Loader
export const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        'skeleton rounded-md',
        className
      )}
      {...props}
    />
  );
};

// Loading Spinner
export const LoadingSpinner = ({ size = 'md', className, ...props }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <Loader2
      className={cn(
        'animate-spin text-orange-600',
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
};

// Card Skeleton
export const CardSkeleton = ({ className, ...props }) => {
  return (
    <div className={cn('card-base p-6 space-y-4', className)} {...props}>
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      <div className="flex space-x-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
};

// List Skeleton
export const ListSkeleton = ({ items = 3, className, ...props }) => {
  return (
    <div className={cn('space-y-3', className)} {...props}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4 p-4 border border-slate-200 rounded-lg">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  );
};

// Table Skeleton
export const TableSkeleton = ({ rows = 5, columns = 4, className, ...props }) => {
  return (
    <div className={cn('space-y-3', className)} {...props}>
      {/* Header */}
      <div className="flex space-x-4 p-4 bg-slate-50 rounded-lg">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} className="h-4 flex-1" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4 p-4 border border-slate-200 rounded-lg">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
};

// Progress Bar
export const ProgressBar = ({ value = 0, max = 100, className, showLabel = true, ...props }) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  return (
    <div className={cn('w-full', className)} {...props}>
      {showLabel && (
        <div className="flex justify-between text-sm text-slate-600 mb-2">
          <span>Progresso</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Loading Overlay
export const LoadingOverlay = ({ isLoading, children, message = 'Carregando...', className, ...props }) => {
  if (!isLoading) return children;

  return (
    <div className={cn('relative', className)} {...props}>
      {children}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
        <div className="flex flex-col items-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-slate-600 font-medium">{message}</p>
        </div>
      </div>
    </div>
  );
};

// Empty State
export const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  action, 
  className, 
  ...props 
}) => {
  return (
    <div className={cn('text-center py-12 px-6', className)} {...props}>
      {Icon && (
        <div className="mx-auto w-16 h-16 text-slate-400 mb-4">
          <Icon className="w-full h-full" />
        </div>
      )}
      {title && (
        <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      )}
      {description && (
        <p className="text-slate-500 mb-6 max-w-md mx-auto">{description}</p>
      )}
      {action && action}
    </div>
  );
};

