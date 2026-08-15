"use client";

import { AlertCircle } from "lucide-react";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main id="main-content" className="state-page"><AlertCircle /><p className="eyebrow">A small pause</p><h1>We couldn’t load this part of the collection.</h1><p>Your basket is safe. Check your connection and try again.</p><button className="button" type="button" onClick={reset}>Try again</button></main>;
}
