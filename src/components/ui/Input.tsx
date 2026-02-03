import { InputHTMLAttributes, forwardRef } from 'react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> { }

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={twMerge(
          clsx(
            'flex h-11 w-full rounded-sm border border-white/10 bg-darkroom/50 px-4 py-2 text-sm text-celluloid ring-offset-void file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-smoke focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-film transition-all focus:border-gold-film/50',
            className
          )
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
