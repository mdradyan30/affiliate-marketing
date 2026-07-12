import { createFileRoute } from "@tanstack/react-router";
import { ReviewForm, emptyReview } from "@/components/review-form";
export const Route = createFileRoute("/admin/reviews/new")({
  component: () => <ReviewForm initial={emptyReview} mode="new" />,
});
