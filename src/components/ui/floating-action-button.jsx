import React, { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const FloatingActionButton = ({ 
  actions = [], 
  className,
  position = 'bottom-right',
  ...props 
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  }

  return (
    <div className={cn('fixed z-50', positionClasses[position], className)} {...props}>
      {/* Action buttons */}
      <div className={cn(
        'flex flex-col-reverse gap-3 mb-3 transition-all duration-300',
        isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      )}>
        {actions.map((action, index) => (
          <Button
            key={index}
            size="sm"
            variant="secondary"
            className="h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
            onClick={() => {
              action.onClick?.()
              setIsOpen(false)
            }}
          >
            <action.icon className="h-5 w-5" />
            <span className="sr-only">{action.label}</span>
          </Button>
        ))}
      </div>

      {/* Main FAB */}
      <Button
        size="lg"
        className={cn(
          'h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300',
          'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
          'hover:scale-110 active:scale-95',
          isOpen && 'rotate-45'
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Plus className="h-6 w-6" />
        )}
      </Button>
    </div>
  )
}

export { FloatingActionButton }

