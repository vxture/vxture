import React from 'react';

type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({
  variant = 'primary',
  size = 'md',
  animated = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  // 使用SCSS类构建基础样式
  const baseClass = `btn btn--${variant} btn--${size}`;
  // 使用Tailwind进行细节调整和扩展
  const animatedClass = animated ? 'btn--animated' : '';
  
  return (
    <button 
      className={`${baseClass} ${animatedClass} ${className} inline-flex items-center justify-center`} 
      {...props}
    >
      {children}
    </button>
  );
}