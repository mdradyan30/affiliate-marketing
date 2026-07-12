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
import { ArrowLeft, Save } from "lucide-react";

export type PostFormValues = {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featured_image: string;
  category_id: string | null;
  status: "draft" | "published";
  seo_title: string;
  seo_description: string;
  focus_keyword: string;
  og_image: string;
  tags: string;
};

export function PostForm({ initial, mode }: { initial: PostFormValues; mode: "new" | "edit" }) {
  const [form, setForm] = useState<PostFormValues>(initial);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const { data: cats = [] } = useQuery({
    queryKey: ["cats-blog"],
    queryFn: async () => (await supabase.from("categories").select("*").eq("kind", "blog").order("name")).data ?? [],
  });

  const set = <K extends keyof PostFormValues>(k: K, v: PostFormValues[K]) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Title is required");
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const payload = {
      slug: form.slug || slugify(form.title),
      title: form.title,
      excerpt: form.excerpt || null,
      content: form.content,
      featured_image: form.featured_image || null,
      category_id: form.category_id,
      status: form.status,
      seo_title: form.seo_title || null,
      seo_description: form.seo_description || null,
      focus_keyword: form.focus_keyword || null,
      og_image: form.og_image || null,
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      published_at: form.status === "published" ? new Date().toISOString() : null,
      author_id: user?.id,
    };
    const { error } = mode === "new"
      ? await supabase.from("posts").insert(payload as any)
      : await supabase.from("posts").update(payload as any).eq("id", form.id!);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    navigate({ to: "/admin/posts" });
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/admin/posts" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to posts</Link>
          <h1 className="mt-2 text-2xl md:text-3xl font-extrabold">{mode === "new" ? "New post" : "Edit post"}</h1>
        </div>
        <Button type="submit" disabled={saving} className="bg-brand text-brand-foreground"><Save className="h-4 w-4 mr-1" />{saving ? "Saving..." : "Save"}</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => { set("title", e.target.value); if (!form.id) set("slug", slugify(e.target.value)); }} />
          </div>
          <div>
            <Label>Slug</Label>
            <Input value={form.slug} onChange={(e) => set("slug", slugify(e.target.value))} />
          </div>
          <div>
            <Label>Content</Label>
            <RichTextEditor value={form.content} onChange={(v) => set("content", v)} placeholder="Write your post..." />
          </div>


        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <h3 className="font-bold text-sm">Publish</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="status">Published</Label>
              <Switch id="status" checked={form.status === "published"} onCheckedChange={(v) => set("status", v ? "published" : "draft")} />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={form.category_id ?? ""} onValueChange={(v) => set("category_id", v || null)}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {cats.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Tags (comma-separated)</Label><Input value={form.tags} onChange={(e) => set("tags", e.target.value)} /></div>
          </div>
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <h3 className="font-bold text-sm">Featured image</h3>
            <div className="flex gap-2">
              <Input placeholder="https://..." value={form.featured_image} onChange={(e) => set("featured_image", e.target.value)} />
              <MediaPicker onSelect={(url) => set("featured_image", url)} title="Choose featured image"
                trigger={<Button type="button" variant="outline" size="sm">Browse</Button>} />
            </div>
            {form.featured_image && <img src={form.featured_image} alt="" className="w-full aspect-video object-cover rounded" />}
          </div>

          <div className="rounded-xl border bg-card p-4 space-y-3">
            <h3 className="font-bold text-sm">SEO</h3>
            <div><Label>SEO title</Label><Input value={form.seo_title} onChange={(e) => set("seo_title", e.target.value)} /></div>
            <div><Label>Meta description</Label><Textarea rows={3} value={form.seo_description} onChange={(e) => set("seo_description", e.target.value)} /></div>
            <div><Label>Focus keyword</Label><Input value={form.focus_keyword} onChange={(e) => set("focus_keyword", e.target.value)} /></div>
            <div><Label>Open Graph image URL</Label>
              <div className="flex gap-2">
                <Input value={form.og_image} onChange={(e) => set("og_image", e.target.value)} />
                <MediaPicker onSelect={(url) => set("og_image", url)} title="Choose OG image"
                  trigger={<Button type="button" variant="outline" size="sm">Browse</Button>} />
              </div>
            </div>

          </div>
        </aside>
      </div>
    </form>
  );
}

export const emptyPost: PostFormValues = {
  slug: "", title: "", excerpt: "", content: "", featured_image: "",
  category_id: null, status: "draft",
  seo_title: "", seo_description: "", focus_keyword: "", og_image: "", tags: "",
};
