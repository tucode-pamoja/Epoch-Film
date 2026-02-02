import Link from 'next/link'
import { ButtonHTMLAttributes, AnchorHTMLAttributes, forwardRef } from 'react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type ButtonBaseProps = {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  href?: string
}

export type ButtonProps = ButtonBaseProps & 
  (ButtonHTMLAttributes<HTMLButtonElement> & AnchorHTMLAttributes<HTMLAnchorElement>)

const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', href, ...props }, ref) => {
    const classes = cn(
      'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
      {
        'bg-primary text-text hover:bg-primary/90': variant === 'primary',
        'bg-accent text-background hover:bg-accent/90': variant === 'secondary',
        'border border-input bg-transparent hover:bg-surface hover:text-text':
          variant === 'outline',
        'hover:bg-surface hover:text-text': variant === 'ghost',
        'h-9 px-3 text-sm': size === 'sm',
        'h-10 px-4 py-2': size === 'md',
        'h-11 px-8 rounded-md': size === 'lg',
      },
      className
    )

    if (href) {
      return (
        <Link
          href={href}
          className={classes}
          {...(props as any)}
        >
          {props.children}
        </Link>
      )
    }

    return (
      <button
        ref={ref as any}
        className={classes}
        {...(props as any)}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button }
