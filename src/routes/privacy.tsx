import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
export const Route = createFileRoute("/privacy")({
  component: () => (
    <SiteShell>
      <section className="mx-auto max-w-3xl px-4 py-16 prose-content">
        <h1>Privacy Policy</h1>
        <p>This site collects only anonymous analytics and any information you voluntarily provide via forms. We do not sell your data.</p>
        <h2>Cookies</h2><p>Cookies are used to remember your theme preference and (optionally) your login session.</p>
        <h2>Affiliate disclosure</h2><p>Many outbound links on this site are affiliate links. We may earn a commission at no extra cost to you.</p>
        <h2>Contact</h2><p>For privacy questions, email hello@digitalgoodsmart.com.</p>
      </section>
    </SiteShell>
  ),
  head: () => ({ meta: [{ title: "Privacy Policy — Digital Goods Mart" }, { name: "description", content: "How Digital Goods Mart handles your data." }] }),
});
