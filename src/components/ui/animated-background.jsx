import React from 'react'
import { cn } from '@/lib/utils'

const AnimatedBackground = ({ 
  children, 
  className,
  variant = 'dots',
  ...props 
}) => {
  const variants = {
    dots: (
      <div className="absolute inset-0 opacity-20 dark:opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, #ea580c 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          animation: 'float 20s ease-in-out infinite'
        }} />
      </div>
    ),
    grid: (
      <div className="absolute inset-0 opacity-10 dark:opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(#ea580c 1px, transparent 1px), linear-gradient(90deg, #ea580c 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }} />
      </div>
    ),
    waves: (
      <div className="absolute inset-0 overflow-hidden opacity-30 dark:opacity-20">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl animate-blob" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-40 left-20 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000" />
      </div>
    ),
    particles: (
      <div className="absolute inset-0 overflow-hidden opacity-20 dark:opacity-10">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-orange-500 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${10 + Math.random() * 20}s`
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div className={cn('relative', className)} {...props}>
      {variants[variant]}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

export { AnimatedBackground }

