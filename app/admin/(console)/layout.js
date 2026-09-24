import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AdminNav from "@/components/admin/AdminNav";
import LogoutButton from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

/**
 * Everything under /admin (except the sign-in page) passes through here, so the
 * role check lives in one place instead of being repeated on every page.
 */
export default async function AdminConsoleLayout({ children }) {
  const user = await getCurrentUser().catch(() => null);

  if (!user) redirect("/admin/login");
  if (user.role !== "admin") redirect("/admin/login?denied=1");

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="border-b border-line bg-brand-900 text-white">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link href="/admin" className="flex shrink-0 items-center gap-2 font-bold">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white text-sm text-brand-900">
              LS
            </span>
            <span className="whitespace-nowrap">
              <span className="hidden xs:inline">Lagos OTRS</span>
              <span className="xs:ml-2 rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                Admin
              </span>
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-3 text-sm">
            <Link
              href="/"
              className="hidden whitespace-nowrap text-white/70 hover:text-white sm:inline"
            >
              View public site
            </Link>
            <span className="hidden whitespace-nowrap text-white/70 md:inline">
              {user.fullName}
            </span>
            <LogoutButton redirectTo="/admin/login" tone="dark" />
          </div>
        </div>
      </header>

      <AdminNav />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-7">{children}</main>

      <footer className="border-t border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted">
          Platform administration — Lagos State Transport Company.
        </div>
      </footer>
    </div>
  );
}
