import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteShell } from "@/components/site-shell";
import { BlogSidebar } from "@/components/blog-sidebar";
import { renderContent } from "@/lib/markdown";
import { formatDate } from "@/lib/utils";
import { Calendar, User as UserIcon, Tag } from "lucide-react";

export const Route = createFileRoute("/blog/$slug")({
  component: PostPage,
  errorComponent: ({ error }) => (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Post unavailable</h1>
        <p className="mt-2 text-muted-foreground">{error.message}</p>
      </div>
    </SiteShell>
  ),
  notFoundComponent: () => (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Post not found</h1>
        <Link to="/blog" className="mt-4 inline-block text-brand hover:underline">← Back to blog</Link>
      </div>
    </SiteShell>
  ),
});

function PostPage() {
  const { slug } = Route.useParams();
  const { data: post, isLoading } = useQuery({
    queryKey: ["post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*, categories(name, slug), profiles(display_name, avatar_url)")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data;
    },
  });

  if (isLoading) return <SiteShell><div className="mx-auto max-w-4xl px-4 py-16"><div className="h-96 bg-muted rounded-xl animate-pulse" /></div></SiteShell>;
  if (!post) return null;

  const html = renderContent(post.content);

  return (
    <SiteShell>
      <article className="mx-auto max-w-7xl px-4 py-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          {post.categories && (
            <Link to="/blog" search={{ category: post.categories.slug }} className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-brand-accent hover:underline">
              <Tag className="h-3 w-3" /> {post.categories.name}
            </Link>
          )}
          <h1 className="mt-2 text-3xl md:text-5xl font-extrabold leading-tight">{post.title}</h1>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
            {post.profiles?.display_name && <span className="inline-flex items-center gap-1"><UserIcon className="h-4 w-4" />{post.profiles.display_name}</span>}
            {post.published_at && <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4" />{formatDate(post.published_at)}</span>}
          </div>
          {post.featured_image && (
            <img src={post.featured_image} alt={post.title} className="mt-6 w-full aspect-[16/9] object-cover rounded-xl border" />
          )}
          {post.excerpt && <p className="mt-6 text-lg text-muted-foreground leading-relaxed">{post.excerpt}</p>}
          <div className="prose-content mt-6" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
        <BlogSidebar />
      </article>
    </SiteShell>
  );
}
