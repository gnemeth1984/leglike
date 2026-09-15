import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-white placeholder:text-neutral-500 outline-none focus:border-lime-400 transition-colors",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
