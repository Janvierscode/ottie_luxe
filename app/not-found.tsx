import Link from "next/link";
import { Search } from "lucide-react";

export default function NotFound() {
  return <main id="main-content" className="state-page"><Search /><p className="eyebrow">Nothing here</p><h1>That page is no longer in the edit.</h1><p>The product may have moved or been archived. Explore the current collection instead.</p><Link className="button" href="/shop">Browse the collection</Link></main>;
}
