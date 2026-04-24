'use client';

import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, LabelHTMLAttributes, ReactNode } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'icon';
};

function joinClasses(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

export function Button({ className, variant = 'default', size = 'default', type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={joinClasses('vx-btn', `vx-btn--${variant}`, `vx-btn--${size}`, className)} {...props} />;
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={joinClasses('vx-input', className)} {...props} />;
}

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={joinClasses('vx-label', className)} {...props} />;
}

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={joinClasses('vx-badge', className)} {...props} />;
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={joinClasses('vx-card', className)} {...props} />;
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={joinClasses('vx-card__header', className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={joinClasses('vx-card__content', className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={joinClasses('vx-card__title', className)} {...props} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={joinClasses('vx-card__description', className)} {...props} />;
}

export function Avatar({ className, children, ...props }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div className={joinClasses('vx-avatar', className)} {...props}>
      {children}
    </div>
  );
}

export function AvatarFallback({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={joinClasses('vx-avatar__fallback', className)} {...props} />;
}

export function Switch({
  className,
  defaultChecked,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { defaultChecked?: boolean }) {
  return (
    <label className={joinClasses('vx-switch', className)}>
      <input type="checkbox" className="vx-switch__input" defaultChecked={defaultChecked} {...props} />
      <span className="vx-switch__track" aria-hidden="true" />
    </label>
  );
}
