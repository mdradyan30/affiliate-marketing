import { Link } from "@tanstack/react-router";
import { Star, ArrowRight } from "lucide-react";

export type ReviewCardData = {
  id: string;
  slug: string;
  product_name: string;
  product_image: string | null;
  rating: number;
  short_description: string | null;
  affiliate_url: string | null;
  categories?: { name: string; slug: string } | null;
};

export function ReviewCard({ review }: { review: ReviewCardData }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-all hover:shadow-lg">
      <Link to="/reviews/$slug" params={{ slug: review.slug }} className="block">
        <div className="aspect-[16/10] overflow-hidden bg-muted">
          {review.product_image ? (
            <img src={review.product_image} alt={review.product_name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-brand-accent/20 to-brand/20" />
          )}
        </div>
      </Link>
      <div className="flex flex-col p-5 flex-1">
        {review.categories && (
          <span className="text-xs font-semibold uppercase tracking-wide text-brand-accent">
            {review.categories.name}
          </span>
        )}
        <Link to="/reviews/$slug" params={{ slug: review.slug }}>
          <h3 className="mt-1 text-lg font-extrabold leading-tight text-foreground group-hover:text-brand">{review.product_name}</h3>
        </Link>
        <div className="mt-2 flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`h-4 w-4 ${i < Math.round(review.rating) ? "fill-brand-accent text-brand-accent" : "text-muted-foreground/30"}`} />
          ))}
          <span className="ml-1 text-xs font-bold">{review.rating.toFixed(1)}</span>
        </div>
        {review.short_description && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-3 flex-1">{review.short_description}</p>
        )}
        <div className="mt-4 flex items-center gap-2">
          <Link
            to="/reviews/$slug"
            params={{ slug: review.slug }}
            className="text-sm font-semibold text-brand hover:underline"
          >
            Read review
          </Link>
          {review.affiliate_url && (
            <a
              href={review.affiliate_url}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="ml-auto inline-flex items-center gap-1 rounded-md bg-brand-accent px-3 py-1.5 text-xs font-bold text-white hover:opacity-90"
            >
              Get it <ArrowRight className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
