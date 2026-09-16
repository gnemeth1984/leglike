import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-neutral-800/60 bg-neutral-950">
      <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-neutral-500">
          © {new Date().getFullYear()} LegLike. All rights reserved.
        </p>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-neutral-500">
          <Link href="/pricing" className="hover:text-neutral-300">Pricing</Link>
          <Link href="/exercises" className="hover:text-neutral-300">Exercises</Link>
          <Link href="/auth/signin" className="hover:text-neutral-300">Sign in</Link>
          <Link href="/disclaimer" className="hover:text-neutral-300">Medical Disclaimer</Link>
          <Link href="/privacy" className="hover:text-neutral-300">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-neutral-300">Terms &amp; Conditions</Link>
          <Link href="/contact" className="hover:text-neutral-300">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
