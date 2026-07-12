import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PostForm, type PostFormValues } from "@/components/post-form";

export const Route = createFileRoute("/admin/posts/$id")({
  component: EditPost,
});

function EditPost() {
  const { id } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-post", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("posts").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>Not found</div>;

  const initial: PostFormValues = {
    id: data.id,
    slug: data.slug,
    title: data.title,
    excerpt: data.excerpt ?? "",
    content: data.content ?? "",
    featured_image: data.featured_image ?? "",
    category_id: data.category_id,
    status: data.status,
    seo_title: data.seo_title ?? "",
    seo_description: data.seo_description ?? "",
    focus_keyword: data.focus_keyword ?? "",
    og_image: data.og_image ?? "",
    tags: (data.tags ?? []).join(", "),
  };
  return <PostForm initial={initial} mode="edit" />;
}
