import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import SiteNav from "@/components/SiteNav";

export default async function SiteLayout({ children }) {
  const user = await getCurrentUser().catch(() => null);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav
        user={
          user ? { fullName: user.fullName, role: user.role } : null
        }
      />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>

      <footer className="border-t border-line bg-surface">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-5 text-xs text-muted">
          <span>
            Lagos State Transport Company — Online Ticket Reservation System.
            Academic prototype.
          </span>
          <span className="ml-auto flex gap-4">
            <Link href="/contact" className="hover:text-brand-700">Contact us</Link>
            <Link href="/verify" className="hover:text-brand-700">Ticket validation</Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
