import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

export default async function SiteLayout({ children }) {
  const user = await getCurrentUser().catch(() => null);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line bg-surface">
        <nav className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
          <Link href="/" className="flex items-center gap-2 font-bold text-ink">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-sm text-white">
              LS
            </span>
            <span className="hidden sm:inline">Lagos OTRS</span>
          </Link>

          <div className="ml-auto flex items-center gap-1 text-sm">
            <Link href="/trips" className="rounded-lg px-3 py-2 text-muted hover:text-ink">
              Find a trip
            </Link>
            {user ? (
              <>
                <Link
                  href="/tickets"
                  className="rounded-lg px-3 py-2 text-muted hover:text-ink"
                >
                  My tickets
                </Link>
                <span className="hidden px-2 text-muted sm:inline">
                  {user.fullName.split(" ")[0]}
                </span>
                <LogoutButton />
              </>
            ) : (
              <>
                <Link href="/login" className="rounded-lg px-3 py-2 text-muted hover:text-ink">
                  Sign in
                </Link>
                <Link href="/register" className="btn-primary !py-2">
                  Create account
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>

      <footer className="border-t border-line bg-surface">
        <div className="mx-auto max-w-5xl px-4 py-5 text-xs text-muted">
          Lagos State Transport Company — Online Ticket Reservation System.
          Academic prototype.
        </div>
      </footer>
    </div>
  );
}
