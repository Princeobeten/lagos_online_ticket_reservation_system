"use client";

import Link from "next/link";
import { useState } from "react";
import LogoutButton from "@/components/LogoutButton";

/**
 * The passenger header. On a phone the links collapse behind a menu button —
 * at 360px wide there is not enough room for "Find a trip", "Sign in" and
 * "Create account" side by side without the words wrapping mid-button.
 */
export default function SiteNav({ user }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const links = [
    { href: "/trips", label: "Find a trip" },
    ...(user ? [{ href: "/tickets", label: "My tickets" }] : []),
    ...(user?.role === "admin" ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <header className="border-b border-line bg-surface">
      <nav className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 font-bold text-ink"
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-600 text-sm text-white">
            LS
          </span>
          <span>Lagos OTRS</span>
        </Link>

        {/* Wide screens: everything laid out in a row */}
        <div className="ml-auto hidden items-center gap-1 text-sm sm:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap rounded-lg px-3 py-2 text-muted hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <>
              <span className="hidden whitespace-nowrap px-2 text-muted md:inline">
                {user.fullName.split(" ")[0]}
              </span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="whitespace-nowrap rounded-lg px-3 py-2 text-muted hover:text-ink"
              >
                Sign in
              </Link>
              <Link href="/register" className="btn-primary !py-2 whitespace-nowrap">
                Create account
              </Link>
            </>
          )}
        </div>

        {/* Phones: one button that opens the panel below */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="site-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          className="ml-auto grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-line text-ink sm:hidden"
        >
          <span className="relative block h-3.5 w-5" aria-hidden="true">
            <span
              className={`absolute left-0 block h-0.5 w-5 bg-current transition-transform ${
                open ? "top-1.5 rotate-45" : "top-0"
              }`}
            />
            <span
              className={`absolute left-0 top-1.5 block h-0.5 w-5 bg-current transition-opacity ${
                open ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute left-0 block h-0.5 w-5 bg-current transition-transform ${
                open ? "top-1.5 -rotate-45" : "top-3"
              }`}
            />
          </span>
        </button>
      </nav>

      {open && (
        <div id="site-menu" className="border-t border-line bg-surface sm:hidden">
          <div className="mx-auto flex max-w-5xl flex-col gap-1 px-4 py-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={close}
                className="rounded-lg px-3 py-2.5 font-medium text-ink hover:bg-canvas"
              >
                {link.label}
              </Link>
            ))}

            {user ? (
              <div className="mt-1 flex items-center justify-between gap-3 border-t border-line pt-3">
                <span className="truncate text-sm text-muted">{user.fullName}</span>
                <LogoutButton />
              </div>
            ) : (
              <div className="mt-1 flex flex-col gap-2 border-t border-line pt-3">
                <Link href="/login" onClick={close} className="btn-ghost w-full">
                  Sign in
                </Link>
                <Link href="/register" onClick={close} className="btn-primary w-full">
                  Create account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
