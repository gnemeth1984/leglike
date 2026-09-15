import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-neutral-800/60 bg-neutral-950/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-lime-400 text-neutral-950">
            L
          </span>
          LegLike
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          <Link href="/#features" className="text-sm text-neutral-300 hover:text-white">
            Features
          </Link>
          <Link href="/exercises" className="text-sm text-neutral-300 hover:text-white">
            Exercise Library
          </Link>
          <Link href="/pricing" className="text-sm text-neutral-300 hover:text-white">
            Pricing
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/signin">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
          <Link href="/auth/signup">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </nav>
    </header>
  );
}
