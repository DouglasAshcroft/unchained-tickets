import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="relative grid min-h-screen place-items-center px-4 py-10 text-center bg-ink-900">
      <div className="pointer-events-none absolute inset-0 opacity-10 bg-gradient-to-br from-resistance-500/20 via-hack-green/10 to-acid-400/20" />

      <div className="relative max-w-[720px] rounded-xl border border-grit-500/30 bg-ink-800/80 backdrop-blur-sm p-6 shadow-xl md:p-8">
        <h1 className="brand-heading text-[clamp(28px,4vw,40px)] mb-3 bg-gradient-to-r from-resistance-500 via-hack-green to-acid-400 bg-clip-text text-transparent">
          Signal Lost
        </h1>

        <p className="mt-3 mb-6 text-base text-grit-300">
          The Resistance can&apos;t be reached right now. We&apos;ll get a
          message to you when it&apos;s safe to return.
        </p>

        <div className="flex justify-center gap-4">
          <Link href="/">
            <Button variant="primary">Return to Base</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
