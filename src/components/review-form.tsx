import { useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RichTextEditor } from "@/components/rich-text-editor";
import { MediaPicker } from "@/components/media-picker";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { slugify } from "@/lib/utils";
import { useNavigate, Link } from "@tanstack/react-router";
import { ArrowLeft, Save, Plus, X } from "lucide-react";

type PricingRow = { plan: string; price: string; features: string };
type FaqRow = { q: string; a: string };

export type ReviewFormValues = {
  id?: string;
  slug: string;
  product_name: string;
  product_image: string;
  rating: number;
  short_description: string;
  content: string;
  pros: string[];
  cons: string[];
  features: string[];
  screenshots: string[];
  pricing: PricingRow[];
  faq: FaqRow[];
  video_url: string;
  affiliate_url: string;
  category_id: string | null;
  status: "draft" | "published";
  seo_title: string;
  seo_description: string;
};

export const emptyReview: ReviewFormValues = {
  slug: "", product_name: "", product_image: "", rating: 4.5, short_description: "", content: "",
  pros: [], cons: [], features: [], screenshots: [], pricing: [], faq: [],
  video_url: "", affiliate_url: "", category_id: null, status: "draft",
  seo_title: "", seo_description: "",
};

function StringListEditor({ label, items, onChange, placeholder }: { label: string; items: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [v, setV] = useState("");
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex gap-2 mt-1">
        <Input value={v} onChange={(e) => setV(e.target.value)} placeholder={placeholder} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (v) { onChange([...items, v]); setV(""); } } }} />
        <Button type="button" size="icon" variant="outline" onClick={() => { if (v) { onChange([...items, v]); setV(""); } }}><Plus className="h-4 w-4" /></Button>
      </div>
      <ul className="mt-2 space-y-1">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-2 rounded border bg-background px-2 py-1 text-sm">
            <span className="flex-1">{it}</span>
            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))}><X className="h-3 w-3" /></button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ReviewForm({ initial, mode }: { initial: ReviewFormValues; mode: "new" | "edit" }) {
  const [form, setForm] = useState<ReviewFormValues>(initial);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const { data: cats = [] } = useQuery({
    queryKey: ["cats-review"],
    queryFn: async () => (await supabase.from("categories").select("*").eq("kind", "review").order("name")).data ?? [],
  });

  const set = <K extends keyof ReviewFormValues>(k: K, v: ReviewFormValues[K]) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.product_name.trim()) return toast.error("Product name required");
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const payload = {
      slug: form.slug || slugify(form.product_name),
      product_name: form.product_name,
      product_image: form.product_image || null,
      rating: form.rating,
      short_description: form.short_description || null,
      content: form.content,
      pros: form.pros,
      cons: form.cons,
      features: form.features,
      screenshots: form.screenshots,
      pricing: form.pricing,
      faq: form.faq,
      video_url: form.video_url || null,
      affiliate_url: form.affiliate_url || null,
      category_id: form.category_id,
      status: form.status,
      seo_title: form.seo_title || null,
      seo_description: form.seo_description || null,
      published_at: form.status === "published" ? new Date().toISOString() : null,
      author_id: user?.id,
    };
    const { error } = mode === "new"
      ? await supabase.from("reviews").insert(payload as any)
      : await supabase.from("reviews").update(payload as any).eq("id", form.id!);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    navigate({ to: "/admin/reviews" });
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/admin/reviews" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back</Link>
          <h1 className="mt-2 text-2xl md:text-3xl font-extrabold">{mode === "new" ? "New review" : "Edit review"}</h1>
        </div>
        <Button type="submit" disabled={saving} className="bg-brand text-brand-foreground"><Save className="h-4 w-4 mr-1" />{saving ? "Saving..." : "Save"}</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <div><Label>Product name</Label><Input value={form.product_name} onChange={(e) => { set("product_name", e.target.value); if (!form.id) set("slug", slugify(e.target.value)); }} /></div>
          <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => set("slug", slugify(e.target.value))} /></div>
          <div><Label>Short description</Label><Textarea rows={2} value={form.short_description} onChange={(e) => set("short_description", e.target.value)} /></div>
          <div><Label>Full review</Label><RichTextEditor value={form.content} onChange={(v) => set("content", v)} placeholder="Write the full review..." /></div>

          <div className="grid grid-cols-2 gap-4">
            <StringListEditor label="Features" items={form.features} onChange={(v) => set("features", v)} placeholder="Add feature" />
            <StringListEditor label="Screenshots (image URLs)" items={form.screenshots} onChange={(v) => set("screenshots", v)} placeholder="https://..." />
            <StringListEditor label="Pros" items={form.pros} onChange={(v) => set("pros", v)} placeholder="Add pro" />
            <StringListEditor label="Cons" items={form.cons} onChange={(v) => set("cons", v)} placeholder="Add con" />
          </div>

          <div className="rounded-xl border bg-card p-4">
            <Label className="text-base">Pricing plans</Label>
            <div className="mt-3 space-y-2">
              {form.pricing.map((p, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_2fr_auto] gap-2 items-start">
                  <Input placeholder="Plan" value={p.plan} onChange={(e) => set("pricing", form.pricing.map((x, j) => j === i ? { ...x, plan: e.target.value } : x))} />
                  <Input placeholder="Price" value={p.price} onChange={(e) => set("pricing", form.pricing.map((x, j) => j === i ? { ...x, price: e.target.value } : x))} />
                  <Input placeholder="Features summary" value={p.features} onChange={(e) => set("pricing", form.pricing.map((x, j) => j === i ? { ...x, features: e.target.value } : x))} />
                  <Button type="button" size="icon" variant="ghost" onClick={() => set("pricing", form.pricing.filter((_, j) => j !== i))}><X className="h-4 w-4" /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => set("pricing", [...form.pricing, { plan: "", price: "", features: "" }])}><Plus className="h-4 w-4 mr-1" /> Add plan</Button>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-4">
            <Label className="text-base">FAQ</Label>
            <div className="mt-3 space-y-2">
              {form.faq.map((f, i) => (
                <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2 items-start">
                  <Input placeholder="Question" value={f.q} onChange={(e) => set("faq", form.faq.map((x, j) => j === i ? { ...x, q: e.target.value } : x))} />
                  <Textarea rows={2} placeholder="Answer" value={f.a} onChange={(e) => set("faq", form.faq.map((x, j) => j === i ? { ...x, a: e.target.value } : x))} />
                  <Button type="button" size="icon" variant="ghost" onClick={() => set("faq", form.faq.filter((_, j) => j !== i))}><X className="h-4 w-4" /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => set("faq", [...form.faq, { q: "", a: "" }])}><Plus className="h-4 w-4 mr-1" /> Add question</Button>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <h3 className="font-bold text-sm">Publish</h3>
            <div className="flex items-center justify-between">
              <Label>Published</Label>
              <Switch checked={form.status === "published"} onCheckedChange={(v) => set("status", v ? "published" : "draft")} />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={form.category_id ?? ""} onValueChange={(v) => set("category_id", v || null)}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>{cats.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Rating (0–5)</Label><Input type="number" min={0} max={5} step={0.1} value={form.rating} onChange={(e) => set("rating", Number(e.target.value))} /></div>
            <div><Label>Affiliate URL</Label><Input value={form.affiliate_url} onChange={(e) => set("affiliate_url", e.target.value)} placeholder="https://..." /></div>
            <div><Label>Video URL (YouTube)</Label><Input value={form.video_url} onChange={(e) => set("video_url", e.target.value)} /></div>
          </div>
          <div className="rounded-xl border bg-card p-4 space-y-2">
            <h3 className="font-bold text-sm">Product image</h3>
            <div className="flex gap-2">
              <Input placeholder="https://..." value={form.product_image} onChange={(e) => set("product_image", e.target.value)} />
              <MediaPicker onSelect={(url) => set("product_image", url)} title="Choose product image"
                trigger={<Button type="button" variant="outline" size="sm">Browse</Button>} />
            </div>

            {form.product_image && <img src={form.product_image} alt="" className="w-full aspect-square object-cover rounded" />}
          </div>
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <h3 className="font-bold text-sm">SEO</h3>
            <div><Label>SEO title</Label><Input value={form.seo_title} onChange={(e) => set("seo_title", e.target.value)} /></div>
            <div><Label>Meta description</Label><Textarea rows={3} value={form.seo_description} onChange={(e) => set("seo_description", e.target.value)} /></div>
          </div>
        </aside>
      </div>
    </form>
  );
}
