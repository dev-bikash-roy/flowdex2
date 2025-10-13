import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
  {
    variants: {
      variant: {
        default: "border-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        glass: "border-white/10 bg-white/5 backdrop-blur-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/50",
        floating: "border-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:scale-[1.02] focus-visible:shadow-lg",
      },
      state: {
        default: "",
        error: "border-destructive focus-visible:ring-destructive/50 text-destructive",
        success: "border-success focus-visible:ring-success/50",
        warning: "border-warning focus-visible:ring-warning/50",
      },
    },
    defaultVariants: {
      variant: "default",
      state: "default",
    },
  }
)

export interface InputProps
  extends React.ComponentProps<"input">,
    VariantProps<typeof inputVariants> {
  icon?: React.ReactNode
  error?: string
  success?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, state, icon, error, success, ...props }, ref) => {
    // Determine state based on error/success props
    const currentState = error ? "error" : success ? "success" : state || "default"
    
    return (
      <div className="relative w-full">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            inputVariants({ variant, state: currentState, className }),
            icon && "pl-10"
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-destructive animate-in slide-in-from-top-1 duration-200">
            {error}
          </p>
        )}
        {success && (
          <p className="mt-1 text-sm text-success animate-in slide-in-from-top-1 duration-200">
            {success}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
