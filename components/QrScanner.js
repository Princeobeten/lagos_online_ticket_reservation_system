"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/**
 * Live camera scanner for the boarding gate. A ticket QR encodes a full
 * /verify/<reference> URL, so a decoded code is turned straight into a route.
 */
export default function QrScanner() {
  const router = useRouter();
  const regionRef = useRef(null);
  const scannerRef = useRef(null);
  const handledRef = useRef(false);
  const [status, setStatus] = useState("starting");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    // If the camera never comes up (no device, or the browser silently
    // stalls), say so instead of showing "starting" for ever.
    const stall = setTimeout(() => {
      if (!cancelled) {
        setStatus((current) => (current === "starting" ? "blocked" : current));
        setError(
          "The camera did not start. Check that this page is allowed to use it, " +
            "or type the reference instead."
        );
      }
    }, 10000);

    async function start() {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (cancelled) return;

        const scanner = new Html5Qrcode("qr-region", { verbose: false });
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" }, // the back camera
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decoded) => {
            if (handledRef.current) return; // one scan is enough
            handledRef.current = true;
            setStatus("found");

            let path = null;
            try {
              const url = new URL(decoded);
              if (url.pathname.startsWith("/verify/")) {
                path = url.pathname + url.search;
              }
            } catch {
              // not a URL: maybe the bare reference was encoded
              const match = /^LSTC-[A-Z0-9]+$/i.exec(decoded.trim());
              if (match) path = `/verify/${decoded.trim().toUpperCase()}`;
            }

            if (!path) {
              handledRef.current = false;
              setError("That code is not a Lagos OTRS ticket.");
              setStatus("scanning");
              return;
            }

            scanner.stop().catch(() => {}).finally(() => router.push(path));
          },
          () => {
            /* a frame without a code is normal, not an error */
          }
        );

        if (!cancelled) {
          clearTimeout(stall);
          setStatus("scanning");
        }
      } catch (err) {
        if (cancelled) return;
        clearTimeout(stall);
        setStatus("blocked");
        setError(
          String(err?.message || err).includes("Permission")
            ? "Camera access was refused. Allow the camera, or type the reference instead."
            : "No camera is available on this device. Type the reference instead."
        );
      }
    }

    start();

    return () => {
      cancelled = true;
      clearTimeout(stall);
      const scanner = scannerRef.current;
      if (scanner?.isScanning) scanner.stop().catch(() => {});
    };
  }, [router]);

  return (
    <div className="space-y-4">
      <div className="card overflow-hidden">
        <div
          id="qr-region"
          ref={regionRef}
          className="aspect-square w-full bg-ink/90 [&_video]:h-full [&_video]:w-full [&_video]:object-cover"
        />
        <div className="border-t border-line p-4 text-center text-sm">
          {status === "starting" && <p className="text-muted">Starting the camera…</p>}
          {status === "scanning" && (
            <p className="text-muted">
              Hold the passenger&apos;s QR code inside the frame.
            </p>
          )}
          {status === "found" && (
            <p className="font-semibold text-brand-700">Code read — opening ticket…</p>
          )}
          {status === "blocked" && <p className="text-red-700">{error}</p>}
        </div>
      </div>

      {error && status !== "blocked" && <p className="alert-error">{error}</p>}

      <Link href="/verify" className="btn-ghost w-full">
        Type the reference instead
      </Link>
    </div>
  );
}
