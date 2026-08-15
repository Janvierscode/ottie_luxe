"use client";

declare global {
  interface Window {
    umami?: { track: (name: string, data?: Record<string, string | number | boolean>) => void };
  }
}

export function trackEvent(name: string, data?: Record<string, string | number | boolean>) {
  try {
    window.umami?.track(name, data);
  } catch {
    // Analytics must never interrupt shopping.
  }
}
