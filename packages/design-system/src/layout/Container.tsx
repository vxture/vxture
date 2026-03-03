import { ComponentProps } from '../types/common';

export const Container = ({ className = '', children }: ComponentProps) => {
  return <div className={`w-full max-w-7xl mx-auto px-4 sm:px-6 ${className}`}>{children}</div>;
};
