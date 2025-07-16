import React, { useState, useRef, useEffect, createContext, useContext } from 'react';
import { cn } from '@/lib/utils';

const TooltipContext = createContext();

export const TooltipProvider = ({ children, delayDuration = 500 }) => {
  return (
    <TooltipContext.Provider value={{ delayDuration }}>
      {children}
    </TooltipContext.Provider>
  );
};

export const TooltipTrigger = ({ children, asChild = false, ...props }) => {
  if (asChild) {
    return React.cloneElement(children, props);
  }
  return <div {...props}>{children}</div>;
};

export const TooltipContent = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        'z-50 px-3 py-2 text-sm text-white bg-slate-900 rounded-md shadow-lg',
        'animate-fade-in max-w-xs break-words',
        className
      )}
      role="tooltip"
      {...props}
    >
      {children}
    </div>
  );
};

export const Tooltip = ({ 
  children, 
  content, 
  position = 'top',
  delay = 500,
  className,
  disabled = false,
  ...props 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [actualPosition, setActualPosition] = useState(position);
  const timeoutRef = useRef(null);
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);

  const showTooltip = () => {
    if (disabled) return;
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      hideTooltip();
    }
  };

  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };

      let newPosition = position;

      // Verifica se o tooltip sai da viewport e ajusta a posição
      switch (position) {
        case 'top':
          if (triggerRect.top - tooltipRect.height < 0) {
            newPosition = 'bottom';
          }
          break;
        case 'bottom':
          if (triggerRect.bottom + tooltipRect.height > viewport.height) {
            newPosition = 'top';
          }
          break;
        case 'left':
          if (triggerRect.left - tooltipRect.width < 0) {
            newPosition = 'right';
          }
          break;
        case 'right':
          if (triggerRect.right + tooltipRect.width > viewport.width) {
            newPosition = 'left';
          }
          break;
      }

      setActualPosition(newPosition);
    }
  }, [isVisible, position]);

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-slate-900',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-slate-900',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-slate-900',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-slate-900'
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      onKeyDown={handleKeyDown}
      {...props}
    >
      <div ref={triggerRef}>
        {children}
      </div>
      
      {isVisible && content && (
        <div
          ref={tooltipRef}
          className={cn(
            'absolute z-50 px-3 py-2 text-sm text-white bg-slate-900 rounded-md shadow-lg',
            'animate-fade-in',
            'max-w-xs break-words',
            positionClasses[actualPosition],
            className
          )}
          role="tooltip"
          aria-hidden={!isVisible}
        >
          {content}
          
          {/* Arrow */}
          <div
            className={cn(
              'absolute w-0 h-0 border-4',
              arrowClasses[actualPosition]
            )}
          />
        </div>
      )}
    </div>
  );
};

