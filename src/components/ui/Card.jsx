import React from 'react';
import { cn } from '../../utils/cn';

const Card = React.forwardRef(({ 
  children, 
  variant = 'default',
  className,
  ...props 
}, ref) => {
  const variants = {
    default: 'bg-zinc-900 border border-zinc-800 rounded-lg',
    elevated: 'bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl',
    subtle: 'bg-zinc-900/50 border border-zinc-800 rounded-lg',
    hover: 'bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-700 transition-all',
  };
  
  const variantClasses = variants[variant] || variants.default;
  
  return (
    <div
      ref={ref}
      className={cn(variantClasses, className)}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export default Card;

