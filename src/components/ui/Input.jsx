// External libraries
import React from 'react';

// Internal utilities
import { cn } from '../../utils/cn';

const Input = React.forwardRef(({ 
  className,
  variant = 'default',
  size = 'md',
  ...props 
}, ref) => {
  const baseClasses = 'bg-zinc-800 border border-zinc-700 rounded-md text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-colors';
  
  const variants = {
    default: '',
    error: 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500',
    success: 'border-emerald-500/50 focus:ring-emerald-500/50 focus:border-emerald-500',
  };
  
  const sizes = {
    sm: 'h-8 px-2 text-xs',
    md: 'h-9 px-3 text-sm',
    lg: 'h-10 px-4 text-base',
  };
  
  const variantClasses = variants[variant] || variants.default;
  const sizeClasses = sizes[size] || sizes.md;
  
  return (
    <input
      ref={ref}
      className={cn(baseClasses, variantClasses, sizeClasses, className)}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export default Input;

