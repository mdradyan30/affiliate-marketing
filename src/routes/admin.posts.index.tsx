import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

export const Route = createFileRoute("/admin/posts/")({
  component: PostsList,
});

function PostsList() {
  const qc = useQueryClient();
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["admin-posts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("posts").select("id, slug, title, status, published_at, updated_at, categories(name)").order("updated_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const del = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin-posts"] });
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold">Blog posts</h1>
          <p className="text-muted-foreground mt-1">Create, edit and publish posts.</p>
        </div>
        <Button asChild className="bg-brand text-brand-foreground"><Link to="/admin/posts/new"><Plus className="h-4 w-4 mr-1" /> New post</Link></Button>
      </div>

      <div className="mt-6 rounded-xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-left">
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3">Category</th>
              <th className="p-3">Status</th>
              <th className="p-3">Updated</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Loading...</td></tr>}
            {!isLoading && posts.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No posts yet.</td></tr>}
            {posts.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3 font-medium">{p.title}</td>
                <td className="p-3 text-muted-foreground">{p.categories?.name ?? "—"}</td>
                <td className="p-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${p.status === "published" ? "bg-brand/10 text-brand" : "bg-muted text-muted-foreground"}`}>{p.status}</span>
                </td>
                <td className="p-3 text-muted-foreground">{formatDate(p.updated_at)}</td>
                <td className="p-3 text-right">
                  <div className="inline-flex gap-1">
                    {p.status === "published" && <Button asChild size="icon" variant="ghost"><a href={`/blog/${p.slug}`} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /></a></Button>}
                    <Button asChild size="icon" variant="ghost"><Link to="/admin/posts/$id" params={{ id: p.id }}><Edit className="h-4 w-4" /></Link></Button>
                    <Button size="icon" variant="ghost" onClick={() => del(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
