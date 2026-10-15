"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// ---------------------------------------------------------------------------
// RouteReporter: keeps the portfolio's integrated browser (NewPortfolio)
// in sync with client-side navigation.
//
// Child → parent on every navigation + mount:
//   { source: "porto-site-route", href: window.location.href }
// Parent → child when the user types an address in the IDE browser:
//   { source: "porto-site-navigate", href }
// The child only honors navigate requests from the portfolio itself and
// only to URLs on its own origin (anti open-redirect).
// ---------------------------------------------------------------------------

function isAllowedParentOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    if (url.protocol === "http:" && url.hostname === "localhost") return true;
    return url.protocol === "https:" && url.hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
}

function reportRoute() {
  const url = new URL(window.location.href);
  window.parent.postMessage(
    { source: "porto-site-route", href: url.origin + url.pathname },
    "*"
  );
}

export default function RouteReporter() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    reportRoute();
  }, [pathname, searchParams]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data as { source?: unknown; href?: unknown } | null;
      if (!data || event.source !== window.parent || !isAllowedParentOrigin(event.origin)) {
        return;
      }
      if (data.source === "porto-site-route-request") {
        reportRoute();
        return;
      }
      if (data.source !== "porto-site-navigate" || typeof data.href !== "string") return;
      let dest: URL;
      try {
        dest = new URL(data.href, window.location.origin);
      } catch {
        return;
      }
      if (dest.origin !== window.location.origin) return;
      if (dest.href !== window.location.href) window.location.assign(dest.href);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return null;
}
