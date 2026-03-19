import Link from "next/link";

export function Navbar() {
  return (
    <header className="w-full border-b border-white/50 bg-[rgb(255_253_247_/_0.52)] backdrop-blur-xl supports-[backdrop-filter]:bg-[rgb(255_253_247_/_0.4)]">
      <div className="mx-auto flex h-16 w-full max-w-[1000px] items-center justify-between px-4 md:px-6">
        <Link
          href="/"
          className="font-[family-name:var(--font-heading)] text-lg font-semibold text-foreground drop-shadow-[0_2px_10px_rgba(15,118,110,0.22)]"
        >
          ResearchMind
        </Link>

        <Link
          href="/history"
          className="rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          History
        </Link>
      </div>
    </header>
  );
}
