import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({ className, variant = "primary", size = "md", ...props }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";
  const variants: Record<string, string> = {
    primary: "bg-lime-400 text-neutral-950 hover:bg-lime-300 shadow-[0_0_30px_-10px_rgba(190,242,100,0.6)]",
    secondary: "bg-neutral-800 text-white hover:bg-neutral-700",
    outline: "border border-neutral-700 text-white hover:bg-neutral-800",
    ghost: "text-neutral-300 hover:text-white hover:bg-neutral-800/50",
  };
  const sizes: Record<string, string> = {
    sm: "text-sm px-4 py-2",
    md: "text-sm px-6 py-3",
    lg: "text-base px-8 py-4",
  };
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
