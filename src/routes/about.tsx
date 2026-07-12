import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";

export const Route = createFileRoute("/about")({
  component: About,
  head: () => ({
    meta: [
      { title: "About — Digital Goods Mart" },
      { name: "description", content: "Learn about Digital Goods Mart — honest affiliate reviews of software, AI tools and MMO products." },
    ],
  }),
});

function About() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-4xl md:text-5xl font-extrabold">About Digital Goods Mart</h1>
        <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
          Digital Goods Mart is an independent affiliate review site run by a working online marketer.
          We publish in-depth, honest reviews of the software, AI tools, design tools, make-money-online products,
          and health products that we personally use and vet.
        </p>
        <div className="prose-content mt-8">
          <h2>What we cover</h2>
          <ul>
            <li><strong>Software</strong> — productivity, marketing, SaaS.</li>
            <li><strong>AI Tools</strong> — copywriting, images, video, automation.</li>
            <li><strong>Design Tools</strong> — graphics, video, mockups.</li>
            <li><strong>MMO Products</strong> — courses, systems and blueprints that actually work.</li>
            <li><strong>Health Products</strong> — supplements and wellness picks.</li>
          </ul>
          <h2>How we make money</h2>
          <p>
            We use affiliate links on many of the products we recommend. When you buy through them we may earn a
            commission at no extra cost to you. It never influences our verdicts — bad products get called out.
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
