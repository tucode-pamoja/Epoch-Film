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
    const classes = twMerge(
      clsx(
        'inline-flex items-center justify-center rounded-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-film disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.98]',
        {
          'bg-gold-film text-void hover:bg-gold-highlight hover:shadow-[0_0_20px_rgba(201,162,39,0.3)]': variant === 'primary',
          'bg-white/5 text-celluloid hover:bg-white/10 border border-white/10': variant === 'secondary',
          'border border-white/20 bg-transparent hover:bg-white/5 text-celluloid':
            variant === 'outline',
          'hover:bg-white/5 text-white/60 hover:text-white': variant === 'ghost',
          'h-8 px-3 text-xs': size === 'sm',
          'h-10 px-5 text-sm': size === 'md',
          'h-12 px-8 text-base': size === 'lg',
        },
        className
      )
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
