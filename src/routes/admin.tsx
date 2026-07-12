import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, FileText, Package, LogOut, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  ssr: false,
  component: AdminLayout,
});

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/posts", label: "Blog posts", icon: FileText },
  { to: "/admin/reviews", label: "Reviews", icon: Package },
];

function AdminLayout() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  const claimAdmin = async () => {
    const { data, error } = await supabase.rpc("claim_first_admin");
    if (error) return toast.error(error.message);
    if (data) { toast.success("You are now admin — reloading."); setTimeout(() => window.location.reload(), 500); }
    else toast.info("An admin already exists. Ask them to grant you access.");
  };

  if (loading) return <div className="min-h-screen grid place-items-center">Loading...</div>;
  if (!user) return null;

  if (!isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center px-4">
        <div className="max-w-md text-center rounded-xl border bg-card p-8">
          <h1 className="text-xl font-bold">Admin access required</h1>
          <p className="mt-2 text-sm text-muted-foreground">Signed in as {user.email}. This area is for site admins only.</p>
          <div className="mt-6 flex gap-2 justify-center">
            <Button onClick={claimAdmin} className="bg-brand text-brand-foreground">Claim as first admin</Button>
            <Button variant="outline" onClick={() => { signOut(); navigate({ to: "/" }); }}>Sign out</Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">The claim option only works if no admin exists yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid md:grid-cols-[240px_minmax(0,1fr)] bg-muted/30">
      <aside className="border-r bg-card p-4 flex flex-col gap-1">
        <Link to="/" className="mb-4 px-2 py-1.5 text-lg font-extrabold text-brand">Digital Goods Mart</Link>
        {nav.map((n) => {
          const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
          return (
            <Link key={n.to} to={n.to} className={cn("flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium", active ? "bg-brand text-brand-foreground" : "hover:bg-accent")}>
              <n.icon className="h-4 w-4" /> {n.label}
            </Link>
          );
        })}
        <div className="mt-auto flex flex-col gap-1">
          <Link to="/" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"><Home className="h-4 w-4" /> View site</Link>
          <button onClick={() => { signOut(); navigate({ to: "/" }); }} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent text-left">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>
      <div className="p-6 md:p-8">
        <Outlet />
      </div>
    </div>
  );
}
