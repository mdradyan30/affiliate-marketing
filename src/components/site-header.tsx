import { Link, useRouterState } from "@tanstack/react-router";
import { Moon, Sun, Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Home" },
  { to: "/blog", label: "Blog" },
  { to: "/reviews", label: "Product Reviews" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const { theme, toggle } = useTheme();
  const { user, isAdmin, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src="/logo.png" alt="Digital Goods Mart" className="h-9 w-9 object-contain" />
          <span className="hidden sm:inline font-extrabold text-lg tracking-tight text-brand">Digital Goods Mart</span>
        </Link>

        <nav className="ml-auto hidden md:flex items-center gap-1">
          {links.map((l) => {
            const active = l.to === "/" ? pathname === "/" : pathname.startsWith(l.to);
            return (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  "px-3 py-2 text-sm font-semibold rounded-md transition-colors",
                  active
                    ? "bg-brand text-brand-foreground"
                    : "text-foreground/80 hover:text-foreground hover:bg-accent"
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto md:ml-2 flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          {user ? (
            <>
              {isAdmin && (
                <Button asChild size="sm" variant="outline" className="hidden sm:inline-flex">
                  <Link to="/admin"><LayoutDashboard className="h-4 w-4 mr-1" />Admin</Link>
                </Button>
              )}
              <Button size="icon" variant="ghost" onClick={signOut} aria-label="Sign out">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link to="/auth">Sign in</Link>
            </Button>
          )}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t bg-background">
          <nav className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="px-3 py-2 text-sm font-semibold rounded-md hover:bg-accent"
              >
                {l.label}
              </Link>
            ))}
            {!user && (
              <Link to="/auth" onClick={() => setOpen(false)} className="px-3 py-2 text-sm font-semibold rounded-md bg-brand text-brand-foreground text-center">
                Sign in
              </Link>
            )}
            {user && isAdmin && (
              <Link to="/admin" onClick={() => setOpen(false)} className="px-3 py-2 text-sm font-semibold rounded-md bg-brand text-brand-foreground text-center">
                Admin dashboard
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
