import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useState } from "react";
import { formatDate } from "@/lib/utils";

export function BlogSidebar() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const { data: popular = [] } = useQuery({
    queryKey: ["popular-posts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("posts")
        .select("id, slug, title, featured_image, published_at, view_count")
        .eq("status", "published")
        .order("view_count", { ascending: false })
        .limit(5);
      return data ?? [];
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["blog-categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").eq("kind", "blog").order("name");
      return data ?? [];
    },
  });

  return (
    <aside className="space-y-6">
      <div className="rounded-xl border bg-card p-5">
        <h3 className="font-bold text-sm mb-3 uppercase tracking-wide">Search</h3>
        <form
          onSubmit={(e) => { e.preventDefault(); navigate({ to: "/blog", search: { q } }); }}
          className="flex gap-2"
        >
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search articles..." />
          <Button type="submit" size="icon" aria-label="Search"><Search className="h-4 w-4" /></Button>
        </form>
      </div>

      <div className="rounded-xl border bg-card p-5">
        <h3 className="font-bold text-sm mb-3 uppercase tracking-wide">Popular Posts</h3>
        <ul className="space-y-4">
          {popular.map((p) => (
            <li key={p.id}>
              <Link to="/blog/$slug" params={{ slug: p.slug }} className="flex gap-3 group">
                <div className="h-16 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                  {p.featured_image && (
                    <img src={p.featured_image} alt="" className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold line-clamp-2 group-hover:text-brand">{p.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatDate(p.published_at)}</p>
                </div>
              </Link>
            </li>
          ))}
          {popular.length === 0 && <li className="text-sm text-muted-foreground">No posts yet.</li>}
        </ul>
      </div>

      <div className="rounded-xl border bg-card p-5">
        <h3 className="font-bold text-sm mb-3 uppercase tracking-wide">Categories</h3>
        <ul className="space-y-1">
          {categories.map((c) => (
            <li key={c.id}>
              <Link
                to="/blog"
                search={{ category: c.slug }}
                className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent"
              >
                <span>{c.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
