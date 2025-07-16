import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

const AnimatedCounter = ({ 
  value, 
  duration = 1000, 
  className,
  prefix = '',
  suffix = '',
  ...props 
}) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime = null
    const startValue = count
    const endValue = value

    const animate = (currentTime) => {
      if (startTime === null) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentCount = Math.floor(startValue + (endValue - startValue) * easeOutQuart)
      
      setCount(currentCount)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [value, duration])

  return (
    <span className={cn('tabular-nums', className)} {...props}>
      {prefix}{count}{suffix}
    </span>
  )
}

export { AnimatedCounter }

