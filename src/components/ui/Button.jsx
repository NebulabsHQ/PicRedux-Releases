import React from 'react';
import { cn } from '../../utils/cn';

const Button = React.forwardRef(({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className,
  disabled = false,
  ...props 
}, ref) => {
  const baseClasses = 'font-medium transition-colors flex items-center justify-center gap-2';
  
  const variants = {
    primary: 'bg-violet-600 hover:bg-violet-500 text-white disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed',
    primaryPurple: 'bg-purple-600 hover:bg-purple-700 text-white disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed',
    secondary: 'bg-transparent border border-zinc-700 hover:bg-zinc-800/50 hover:text-white text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed',
    ghost: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed',
    danger: 'bg-red-600 hover:bg-red-700 text-white disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed',
    icon: 'bg-black/60 backdrop-blur-sm border border-zinc-700/50 hover:bg-violet-500 hover:border-violet-600 text-zinc-300 hover:text-white shadow-lg hover:shadow-xl hover:shadow-violet-500/20',
    iconDanger: 'bg-black/60 backdrop-blur-sm border border-zinc-700/50 hover:bg-red-500 hover:border-red-600 text-zinc-300 hover:text-white shadow-lg hover:shadow-xl hover:shadow-red-500/20',
    tab: 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700',
    tabActive: 'bg-violet-600 text-white',
    tabError: 'bg-zinc-800 text-red-400 hover:text-red-300 hover:bg-zinc-700',
    tabErrorActive: 'bg-red-600 text-white',
  };
  
  const sizes = {
    xs: 'h-7 px-2 text-xs rounded-md',
    sm: 'h-8 px-3 text-xs rounded-md',
    md: 'h-9 px-4 text-sm rounded-md',
    lg: 'px-4 py-2.5 text-sm rounded-lg',
    icon: 'w-8 h-8 rounded-full',
  };
  
  const variantClasses = variants[variant] || variants.primary;
  const sizeClasses = sizes[size] || sizes.md;
  
  return (
    <button
      ref={ref}
      className={cn(baseClasses, variantClasses, sizeClasses, className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;

