import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const origin = `${url.protocol}//${url.host}`;
        const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
          auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
        });
        const [{ data: posts }, { data: reviews }] = await Promise.all([
          sb.from("posts").select("slug, updated_at").eq("status", "published"),
          sb.from("reviews").select("slug, updated_at").eq("status", "published"),
        ]);
        const staticPages = ["", "blog", "reviews", "about", "contact", "privacy", "terms"];
        const urls = [
          ...staticPages.map((p) => `<url><loc>${origin}/${p}</loc></url>`),
          ...(posts ?? []).map((p) => `<url><loc>${origin}/blog/${p.slug}</loc><lastmod>${p.updated_at}</lastmod></url>`),
          ...(reviews ?? []).map((r) => `<url><loc>${origin}/reviews/${r.slug}</loc><lastmod>${r.updated_at}</lastmod></url>`),
        ].join("");
        const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
        return new Response(xml, { headers: { "content-type": "application/xml" } });
      },
    },
  },
});
