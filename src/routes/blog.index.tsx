import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { SiteShell } from "@/components/site-shell";
import { PostCard, type PostCardData } from "@/components/post-card";
import { BlogSidebar } from "@/components/blog-sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Search } from "lucide-react";

const PAGE_SIZE = 9;

const searchSchema = z.object({
  page: z.coerce.number().min(1).default(1).catch(1),
  category: z.string().optional().catch(undefined),
  q: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/blog/")({
  validateSearch: searchSchema,
  component: BlogPage,
  head: () => ({
    meta: [
      { title: "Blog — Digital Goods Mart" },
      { name: "description", content: "All blog posts: reviews, tutorials, comparisons on software, AI tools, design tools, MMO and health." },
    ],
  }),
});

function BlogPage() {
  const { page, category, q } = Route.useSearch();
  const navigate = useNavigate();
  const [qInput, setQInput] = useState(q ?? "");

  const { data, isLoading } = useQuery({
    queryKey: ["blog-list", page, category, q],
    queryFn: async () => {
      let query = supabase
        .from("posts")
        .select("id, slug, title, excerpt, featured_image, published_at, categories!inner(name, slug), profiles(display_name)", { count: "exact" })
        .eq("status", "published")
        .order("published_at", { ascending: false });
      if (category) query = query.eq("categories.slug", category);
      if (q) query = query.ilike("title", `%${q}%`);
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data, count } = await query.range(from, to);
      return { posts: (data ?? []) as unknown as PostCardData[], count: count ?? 0 };
    },
  });

  const posts = data?.posts ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.count ?? 0) / PAGE_SIZE));

  return (
    <SiteShell>
      <section className="border-b bg-accent/30">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <h1 className="text-3xl md:text-4xl font-extrabold">Blog</h1>
          <p className="mt-2 text-muted-foreground">Reviews, tutorials, and comparisons.</p>
          <form
            className="mt-4 flex gap-2 max-w-md"
            onSubmit={(e) => { e.preventDefault(); navigate({ to: "/blog", search: { q: qInput || undefined, category } }); }}
          >
            <Input value={qInput} onChange={(e) => setQInput(e.target.value)} placeholder="Search posts..." />
            <Button type="submit" size="icon" aria-label="Search"><Search className="h-4 w-4" /></Button>
          </form>
          {category && (
            <div className="mt-3 text-sm">
              Filtering by <span className="font-semibold text-brand">{category}</span>{" "}
              <Link to="/blog" className="text-brand-accent hover:underline">clear</Link>
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-80 rounded-xl bg-muted animate-pulse" />)}</div>
          ) : posts.length === 0 ? (
            <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">No posts found.</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {posts.map((p) => <PostCard key={p.id} post={p} />)}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button variant="outline" disabled={page <= 1} onClick={() => navigate({ to: "/blog", search: { page: page - 1, category, q } })}>
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
              <Button variant="outline" disabled={page >= totalPages} onClick={() => navigate({ to: "/blog", search: { page: page + 1, category, q } })}>
                Next
              </Button>
            </div>
          )}
        </div>
        <BlogSidebar />
      </div>
    </SiteShell>
  );
}
