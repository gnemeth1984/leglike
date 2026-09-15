import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-sm p-6",
        className
      )}
      {...props}
    />
  );
}
