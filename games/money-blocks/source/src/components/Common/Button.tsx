import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'welcome';
}

/** Shared button used by welcome/setup/how-to-play screens (maps to .welcome-btn / .setup-start / .side-btn styles via className). */
export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  const base = variant === 'welcome' ? 'welcome-btn' : variant === 'primary' ? 'setup-start' : 'side-btn';
  return <button className={`${base} ${className}`.trim()} {...props} />;
}

