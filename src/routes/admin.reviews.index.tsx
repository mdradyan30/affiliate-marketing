import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, ExternalLink, Star } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

export const Route = createFileRoute("/admin/reviews/")({
  component: ReviewsList,
});

function ReviewsList() {
  const qc = useQueryClient();
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async () => {
      const { data, error } = await supabase.from("reviews").select("id, slug, product_name, rating, status, updated_at, categories(name)").order("updated_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const del = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin-reviews"] });
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold">Product reviews</h1>
          <p className="text-muted-foreground mt-1">Manage your product review pages.</p>
        </div>
        <Button asChild className="bg-brand text-brand-foreground"><Link to="/admin/reviews/new"><Plus className="h-4 w-4 mr-1" /> New review</Link></Button>
      </div>

      <div className="mt-6 rounded-xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-left">
            <tr><th className="p-3">Product</th><th className="p-3">Category</th><th className="p-3">Rating</th><th className="p-3">Status</th><th className="p-3">Updated</th><th className="p-3 text-right">Actions</th></tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Loading...</td></tr>}
            {!isLoading && reviews.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No reviews yet.</td></tr>}
            {reviews.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3 font-medium">{r.product_name}</td>
                <td className="p-3 text-muted-foreground">{r.categories?.name ?? "—"}</td>
                <td className="p-3"><span className="inline-flex items-center gap-1"><Star className="h-3 w-3 fill-brand-accent text-brand-accent" />{r.rating}</span></td>
                <td className="p-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${r.status === "published" ? "bg-brand/10 text-brand" : "bg-muted text-muted-foreground"}`}>{r.status}</span>
                </td>
                <td className="p-3 text-muted-foreground">{formatDate(r.updated_at)}</td>
                <td className="p-3 text-right">
                  <div className="inline-flex gap-1">
                    {r.status === "published" && <Button asChild size="icon" variant="ghost"><a href={`/reviews/${r.slug}`} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /></a></Button>}
                    <Button asChild size="icon" variant="ghost"><Link to="/admin/reviews/$id" params={{ id: r.id }}><Edit className="h-4 w-4" /></Link></Button>
                    <Button size="icon" variant="ghost" onClick={() => del(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
