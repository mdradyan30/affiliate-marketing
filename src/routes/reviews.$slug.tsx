import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteShell } from "@/components/site-shell";
import { renderContent } from "@/lib/markdown";
import { Star, Check, X, ArrowRight, ExternalLink } from "lucide-react";

type PricingRow = { plan: string; price: string; features?: string };
type FaqRow = { q: string; a: string };

export const Route = createFileRoute("/reviews/$slug")({
  component: ReviewPage,
  errorComponent: ({ error }) => (
    <SiteShell><div className="mx-auto max-w-3xl px-4 py-16 text-center"><h1 className="text-2xl font-bold">Review unavailable</h1><p className="mt-2 text-muted-foreground">{error.message}</p></div></SiteShell>
  ),
  notFoundComponent: () => (
    <SiteShell><div className="mx-auto max-w-3xl px-4 py-16 text-center"><h1 className="text-2xl font-bold">Review not found</h1><Link to="/reviews" className="mt-4 inline-block text-brand hover:underline">← All reviews</Link></div></SiteShell>
  ),
});

function ReviewPage() {
  const { slug } = Route.useParams();
  const { data: review, isLoading } = useQuery({
    queryKey: ["review", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("reviews").select("*, categories(name, slug)").eq("slug", slug).eq("status", "published").maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data;
    },
  });

  if (isLoading) return <SiteShell><div className="mx-auto max-w-4xl px-4 py-16"><div className="h-96 bg-muted rounded-xl animate-pulse" /></div></SiteShell>;
  if (!review) return null;

  const html = renderContent(review.content);
  const pricing = (Array.isArray(review.pricing) ? review.pricing : []) as unknown as PricingRow[];
  const faq = (Array.isArray(review.faq) ? review.faq : []) as unknown as FaqRow[];
  const videoEmbed = getYouTubeEmbed(review.video_url);

  return (
    <SiteShell>
      <article className="mx-auto max-w-5xl px-4 py-10">
        {/* Header */}
        <div className="rounded-2xl border bg-card p-6 md:p-10">
          <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_240px] items-start">
            <div>
              {review.categories && <span className="text-xs font-bold uppercase tracking-wide text-brand-accent">{review.categories.name}</span>}
              <h1 className="mt-2 text-3xl md:text-5xl font-extrabold">{review.product_name}</h1>
              <div className="mt-3 flex items-center gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-5 w-5 ${i < Math.round(review.rating) ? "fill-brand-accent text-brand-accent" : "text-muted-foreground/30"}`} />
                ))}
                <span className="ml-1 font-bold">{review.rating.toFixed(1)} / 5</span>
              </div>
              {review.short_description && <p className="mt-4 text-lg text-muted-foreground">{review.short_description}</p>}
              {review.affiliate_url && (
                <a href={review.affiliate_url} target="_blank" rel="noopener noreferrer sponsored" className="mt-6 inline-flex items-center gap-2 rounded-md bg-brand-accent px-6 py-3 text-sm font-bold text-white hover:opacity-90">
                  Get {review.product_name} <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
            {review.product_image && (
              <div className="rounded-xl overflow-hidden border bg-muted aspect-square">
                <img src={review.product_image} alt={review.product_name} className="h-full w-full object-cover" />
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        {review.features && review.features.length > 0 && (
          <section className="mt-10">
            <h2 className="text-2xl font-extrabold">Key features</h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {review.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 rounded-lg border bg-card p-3">
                  <Check className="h-5 w-5 text-brand mt-0.5 shrink-0" />
                  <span className="text-sm">{f}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Body */}
        {review.content && <div className="prose-content mt-10" dangerouslySetInnerHTML={{ __html: html }} />}

        {/* Video */}
        {videoEmbed && (
          <section className="mt-10">
            <h2 className="text-2xl font-extrabold mb-4">Video walkthrough</h2>
            <div className="aspect-video rounded-xl overflow-hidden border">
              <iframe src={videoEmbed} title="Video" className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            </div>
          </section>
        )}

        {/* Screenshots */}
        {review.screenshots && review.screenshots.length > 0 && (
          <section className="mt-10">
            <h2 className="text-2xl font-extrabold mb-4">Screenshots</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {review.screenshots.map((s, i) => (
                <img key={i} src={s} alt={`Screenshot ${i + 1}`} className="rounded-xl border w-full" />
              ))}
            </div>
          </section>
        )}

        {/* Pros & Cons */}
        {(review.pros.length > 0 || review.cons.length > 0) && (
          <section className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border bg-card p-6">
              <h3 className="text-xl font-bold text-brand">Pros</h3>
              <ul className="mt-3 space-y-2">
                {review.pros.map((p, i) => <li key={i} className="flex gap-2"><Check className="h-5 w-5 text-brand mt-0.5 shrink-0" /><span className="text-sm">{p}</span></li>)}
              </ul>
            </div>
            <div className="rounded-xl border bg-card p-6">
              <h3 className="text-xl font-bold text-destructive">Cons</h3>
              <ul className="mt-3 space-y-2">
                {review.cons.map((c, i) => <li key={i} className="flex gap-2"><X className="h-5 w-5 text-destructive mt-0.5 shrink-0" /><span className="text-sm">{c}</span></li>)}
              </ul>
            </div>
          </section>
        )}

        {/* Pricing */}
        {pricing.length > 0 && (
          <section className="mt-10">
            <h2 className="text-2xl font-extrabold mb-4">Pricing</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {pricing.map((p, i) => (
                <div key={i} className="rounded-xl border bg-card p-6">
                  <div className="font-bold text-sm text-brand-accent uppercase">{p.plan}</div>
                  <div className="mt-2 text-3xl font-extrabold">{p.price}</div>
                  {p.features && <p className="mt-3 text-sm text-muted-foreground">{p.features}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FAQ */}
        {faq.length > 0 && (
          <section className="mt-10">
            <h2 className="text-2xl font-extrabold mb-4">Frequently asked questions</h2>
            <div className="space-y-3">
              {faq.map((f, i) => (
                <details key={i} className="rounded-xl border bg-card p-4 group">
                  <summary className="cursor-pointer font-semibold list-none flex items-center justify-between">
                    <span>{f.q}</span>
                    <span className="text-brand group-open:rotate-180 transition-transform">▾</span>
                  </summary>
                  <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        {review.affiliate_url && (
          <section className="mt-12 rounded-2xl bg-gradient-to-br from-brand to-brand-accent p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl font-extrabold">Ready to try {review.product_name}?</h2>
            <p className="mt-2 opacity-90">Grab our recommended pick and start today.</p>
            <a href={review.affiliate_url} target="_blank" rel="noopener noreferrer sponsored" className="mt-5 inline-flex items-center gap-2 rounded-md bg-white px-6 py-3 font-bold text-brand hover:bg-white/90">
              Get {review.product_name} <ArrowRight className="h-4 w-4" />
            </a>
          </section>
        )}
      </article>
    </SiteShell>
  );
}

function getYouTubeEmbed(url: string | null): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}
