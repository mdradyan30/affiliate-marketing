import { Link } from "@tanstack/react-router";
import { Calendar, User as UserIcon, Tag } from "lucide-react";
import { formatDate } from "@/lib/utils";

export type PostCardData = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  featured_image: string | null;
  published_at: string | null;
  categories?: { name: string; slug: string } | null;
  profiles?: { display_name: string | null } | null;
};

export function PostCard({ post, featured = false }: { post: PostCardData; featured?: boolean }) {
  return (
    <article className={`group overflow-hidden rounded-xl border bg-card transition-all hover:shadow-lg ${featured ? "md:col-span-2 md:row-span-2" : ""}`}>
      <Link to="/blog/$slug" params={{ slug: post.slug }} className="block">
        <div className={`overflow-hidden bg-muted ${featured ? "aspect-[16/9]" : "aspect-[16/10]"}`}>
          {post.featured_image ? (
            <img src={post.featured_image} alt={post.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-brand/20 to-brand-accent/20" />
          )}
        </div>
      </Link>
      <div className="p-5">
        {post.categories && (
          <Link
            to="/blog"
            search={{ category: post.categories.slug }}
            className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-brand-accent hover:underline"
          >
            <Tag className="h-3 w-3" /> {post.categories.name}
          </Link>
        )}
        <Link to="/blog/$slug" params={{ slug: post.slug }}>
          <h3 className={`mt-2 font-extrabold leading-tight text-foreground group-hover:text-brand ${featured ? "text-2xl md:text-3xl" : "text-lg"}`}>
            {post.title}
          </h3>
        </Link>
        {post.excerpt && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          {post.profiles?.display_name && (
            <span className="inline-flex items-center gap-1"><UserIcon className="h-3 w-3" /> {post.profiles.display_name}</span>
          )}
          {post.published_at && (
            <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(post.published_at)}</span>
          )}
        </div>
        <Link
          to="/blog/$slug"
          params={{ slug: post.slug }}
          className="mt-4 inline-block text-sm font-semibold text-brand hover:underline"
        >
          Continue reading →
        </Link>
      </div>
    </article>
  );
}
