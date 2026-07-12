import { createFileRoute } from "@tanstack/react-router";
import { PostForm, emptyPost } from "@/components/post-form";

export const Route = createFileRoute("/admin/posts/new")({
  component: () => <PostForm initial={emptyPost} mode="new" />,
});
