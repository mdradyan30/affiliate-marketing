import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
export const Route = createFileRoute("/terms")({
  component: () => (
    <SiteShell>
      <section className="mx-auto max-w-3xl px-4 py-16 prose-content">
        <h1>Terms &amp; Conditions</h1>
        <p>By using this site you agree to the following terms. Content is provided for informational purposes and does not constitute financial or medical advice.</p>
        <h2>Affiliate links</h2><p>We participate in various affiliate programs. Purchases through outbound links may earn us a commission.</p>
        <h2>Trademarks</h2><p>All product names, logos and brands are property of their respective owners.</p>
      </section>
    </SiteShell>
  ),
  head: () => ({ meta: [{ title: "Terms — Digital Goods Mart" }, { name: "description", content: "Terms of use for Digital Goods Mart." }] }),
});
