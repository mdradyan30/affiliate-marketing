import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ReviewForm, type ReviewFormValues } from "@/components/review-form";

export const Route = createFileRoute("/admin/reviews/$id")({
  component: EditReview,
});

function EditReview() {
  const { id } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-review", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("reviews").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
  });
  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>Not found</div>;

  const initial: ReviewFormValues = {
    id: data.id,
    slug: data.slug,
    product_name: data.product_name,
    product_image: data.product_image ?? "",
    rating: Number(data.rating ?? 0),
    short_description: data.short_description ?? "",
    content: data.content ?? "",
    pros: data.pros ?? [],
    cons: data.cons ?? [],
    features: data.features ?? [],
    screenshots: data.screenshots ?? [],
    pricing: (Array.isArray(data.pricing) ? data.pricing : []) as any,
    faq: (Array.isArray(data.faq) ? data.faq : []) as any,
    video_url: data.video_url ?? "",
    affiliate_url: data.affiliate_url ?? "",
    category_id: data.category_id,
    status: data.status,
    seo_title: data.seo_title ?? "",
    seo_description: data.seo_description ?? "",
  };
  return <ReviewForm initial={initial} mode="edit" />;
}
