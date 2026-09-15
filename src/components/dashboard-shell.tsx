"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/assessment", label: "Assessment" },
  { href: "/rehab", label: "Rehab Plans" },
  { href: "/exercises", label: "Exercise Library" },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-neutral-950">
      <header className="border-b border-neutral-800/60 bg-neutral-900/40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold text-white">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-lime-400 text-neutral-950">
              L
            </span>
            LegLike
          </Link>
          <nav className="hidden gap-6 md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "text-sm",
                  pathname === l.href ? "text-lime-400" : "text-neutral-400 hover:text-white"
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-sm text-neutral-400 hover:text-white"
          >
            Sign out
          </button>
        </div>
      </header>
      {children}
    </div>
  );
}
