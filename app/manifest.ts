import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return { name: "Ottie Luxe", short_name: "Ottie Luxe", description: "Jewellery, fragrances and gifts in Zimbabwe.", start_url: "/", display: "standalone", background_color: "#fffaf7", theme_color: "#5b1939", icons: [] };
}
