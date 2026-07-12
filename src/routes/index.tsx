import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteShell } from "@/components/site-shell";
import { PostCard, type PostCardData } from "@/components/post-card";
import { ReviewCard, type ReviewCardData } from "@/components/review-card";
import { BlogSidebar } from "@/components/blog-sidebar";
import { Link } from "@tanstack/react-router";
import { Sparkles, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Digital Goods Mart — Honest Reviews of Software, AI Tools & MMO Products" },
      { name: "description", content: "Latest affiliate reviews and tutorials on software, AI tools, design tools, make-money-online and health products." },
    ],
  }),
});

function Home() {
  const { data: posts = [] } = useQuery({
    queryKey: ["home-posts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("posts")
        .select("id, slug, title, excerpt, featured_image, published_at, categories(name, slug), profiles(display_name)")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(10);
      return (data ?? []) as unknown as PostCardData[];
    },
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["home-reviews"],
    queryFn: async () => {
      const { data } = await supabase
        .from("reviews")
        .select("id, slug, product_name, product_image, rating, short_description, affiliate_url, categories(name, slug)")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(4);
      return (data ?? []) as unknown as ReviewCardData[];
    },
  });

  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <SiteShell>
      {/* Hero band */}
      <section className="border-b bg-gradient-to-br from-brand/5 via-background to-brand-accent/5">
        <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-accent/10 px-3 py-1 text-xs font-semibold text-brand-accent uppercase tracking-wide">
              <Sparkles className="h-3 w-3" /> Fresh reviews every week
            </span>
            <h1 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
              Real reviews of the tools that actually <span className="text-brand">make money online</span>.
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Software, AI tools, design tools, MMO products and health picks — tested by a working affiliate marketer.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to="/blog" className="inline-flex items-center gap-1 rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground hover:opacity-90">
                Browse the blog <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/reviews" className="inline-flex items-center gap-1 rounded-md border-2 border-brand px-5 py-2.5 text-sm font-semibold text-brand hover:bg-brand hover:text-brand-foreground transition-colors">
                See product reviews
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Main column */}
        <div>
          <header className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold">Latest posts</h2>
              <p className="text-sm text-muted-foreground mt-1">Fresh reviews, tutorials and comparisons.</p>
            </div>
            <Link to="/blog" className="text-sm font-semibold text-brand hover:underline">View all →</Link>
          </header>

          {posts.length === 0 ? (
            <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
              No posts published yet. Sign in as admin to create your first post.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {featured && <PostCard post={featured} featured />}
              {rest.map((p) => <PostCard key={p.id} post={p} />)}
            </div>
          )}

          {reviews.length > 0 && (
            <section className="mt-14">
              <header className="mb-6 flex items-end justify-between">
                <div>
                  <h2 className="text-2xl md:text-3xl font-extrabold">Top product reviews</h2>
                  <p className="text-sm text-muted-foreground mt-1">Hand-picked tools we recommend.</p>
                </div>
                <Link to="/reviews" className="text-sm font-semibold text-brand hover:underline">View all →</Link>
              </header>
              <div className="grid gap-6 sm:grid-cols-2">
                {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <BlogSidebar />
      </div>
    </SiteShell>
  );
}
