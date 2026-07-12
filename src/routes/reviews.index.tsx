import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { SiteShell } from "@/components/site-shell";
import { ReviewCard, type ReviewCardData } from "@/components/review-card";
import { Button } from "@/components/ui/button";

const searchSchema = z.object({
  category: z.string().optional().catch(undefined),
  page: z.coerce.number().min(1).default(1).catch(1),
});

const PAGE_SIZE = 9;

const CATS = [
  { slug: "software-review", name: "Software" },
  { slug: "ai-tools-review", name: "AI Tools" },
  { slug: "design-tools-review", name: "Design Tools" },
  { slug: "mmo-review", name: "MMO" },
  { slug: "health-review", name: "Health Products" },
];

export const Route = createFileRoute("/reviews/")({
  validateSearch: searchSchema,
  component: ReviewsPage,
  head: () => ({
    meta: [
      { title: "Product Reviews — Digital Goods Mart" },
      { name: "description", content: "In-depth product reviews of software, AI tools, design tools, MMO and health products with pros, cons and pricing." },
    ],
  }),
});

function ReviewsPage() {
  const { category, page } = Route.useSearch();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["reviews-list", category, page],
    queryFn: async () => {
      let query = supabase
        .from("reviews")
        .select("id, slug, product_name, product_image, rating, short_description, affiliate_url, categories!inner(name, slug)", { count: "exact" })
        .eq("status", "published")
        .order("published_at", { ascending: false });
      if (category) query = query.eq("categories.slug", category);
      const from = (page - 1) * PAGE_SIZE;
      const { data, count } = await query.range(from, from + PAGE_SIZE - 1);
      return { reviews: (data ?? []) as unknown as ReviewCardData[], count: count ?? 0 };
    },
  });

  const reviews = data?.reviews ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.count ?? 0) / PAGE_SIZE));

  return (
    <SiteShell>
      <section className="border-b bg-gradient-to-br from-brand-accent/5 to-background">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <h1 className="text-3xl md:text-4xl font-extrabold">Product Reviews</h1>
          <p className="mt-2 text-muted-foreground">Honest, in-depth reviews of the tools we actually use.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={() => navigate({ to: "/reviews", search: {} })} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${!category ? "bg-brand text-brand-foreground" : "bg-accent"}`}>All</button>
            {CATS.map((c) => (
              <button key={c.slug} onClick={() => navigate({ to: "/reviews", search: { category: c.slug } })} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${category === c.slug ? "bg-brand text-brand-foreground" : "bg-accent hover:bg-brand hover:text-brand-foreground transition-colors"}`}>
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10">
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-80 rounded-xl bg-muted animate-pulse" />)}</div>
        ) : reviews.length === 0 ? (
          <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">No reviews yet in this category.</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
          </div>
        )}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <Button variant="outline" disabled={page <= 1} onClick={() => navigate({ to: "/reviews", search: { category, page: page - 1 } })}>Previous</Button>
            <span className="self-center text-sm">Page {page} of {totalPages}</span>
            <Button variant="outline" disabled={page >= totalPages} onClick={() => navigate({ to: "/reviews", search: { category, page: page + 1 } })}>Next</Button>
          </div>
        )}
      </div>
    </SiteShell>
  );
}
