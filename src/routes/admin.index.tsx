import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Package, Eye, Edit } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [posts, reviews, published] = await Promise.all([
        supabase.from("posts").select("id", { count: "exact", head: true }),
        supabase.from("reviews").select("id", { count: "exact", head: true }),
        supabase.from("posts").select("id", { count: "exact", head: true }).eq("status", "published"),
      ]);
      return { posts: posts.count ?? 0, reviews: reviews.count ?? 0, published: published.count ?? 0 };
    },
  });

  const cards = [
    { label: "Total posts", value: stats?.posts ?? 0, icon: FileText, color: "text-brand" },
    { label: "Published", value: stats?.published ?? 0, icon: Eye, color: "text-brand-accent" },
    { label: "Reviews", value: stats?.reviews ?? 0, icon: Package, color: "text-brand" },
  ];

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-extrabold">Dashboard</h1>
      <p className="text-muted-foreground mt-1">Overview of your content.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border bg-card p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{c.label}</span>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </div>
            <div className="mt-2 text-4xl font-extrabold">{c.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
