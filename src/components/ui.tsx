import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("glass-card rounded-3xl p-5 md:p-6", className)} {...props} />
));
Card.displayName = "Card";

export const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' }>(({ className, variant = 'primary', ...props }, ref) => {
  const variants = {
    primary: "neu-button-primary font-bold tracking-wide",
    secondary: "neu-button text-emerald-500 font-bold",
    outline: "neu-inset text-emerald-500 hover:text-emerald-400 font-bold transition-all"
  };

  return (
    <button
      ref={ref}
      className={cn("px-5 py-2.5 rounded-2xl flex items-center justify-center gap-2", variants[variant], className)}
      {...props}
    />
  );
});
Button.displayName = "Button";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "flex h-11 w-full rounded-2xl neu-inset px-4 py-2 text-sm text-charcoal-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

export const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn("text-xs font-bold uppercase tracking-wider text-emerald-500 mb-1 block peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}
    {...props}
  />
));
Label.displayName = "Label";
