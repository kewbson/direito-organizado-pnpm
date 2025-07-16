import React from 'react'
import { cn } from '@/lib/utils'

const GradientCard = ({ 
  children, 
  className,
  variant = 'default',
  hover = true,
  ...props 
}) => {
  const variants = {
    default: 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800',
    orange: 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20',
    blue: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20',
    green: 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20',
    purple: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20',
    amber: 'bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950/20 dark:to-orange-900/20',
    glass: 'bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-900/80 dark:to-gray-800/40 backdrop-blur-sm',
    rainbow: 'bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 dark:from-pink-950/20 dark:via-purple-950/20 dark:to-indigo-950/20'
  }

  return (
    <div
      className={cn(
        'rounded-xl border shadow-sm transition-all duration-300',
        variants[variant],
        hover && 'hover:shadow-md hover:scale-[1.02] hover:-translate-y-1',
        'relative overflow-hidden',
        className
      )}
      {...props}
    >
      {/* Subtle shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      
      {children}
    </div>
  )
}

export { GradientCard }

