import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState } from "react";
import { z } from "zod";
import { Mail, MessageSquare } from "lucide-react";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  email: z.string().trim().email("Enter a valid email").max(255),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000),
});

export const Route = createFileRoute("/contact")({
  component: Contact,
  head: () => ({
    meta: [
      { title: "Contact — Digital Goods Mart" },
      { name: "description", content: "Get in touch with Digital Goods Mart about reviews, partnerships or affiliate opportunities." },
    ],
  }),
});

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setSending(true);
    setTimeout(() => {
      toast.success("Thanks — we'll be in touch shortly.");
      setForm({ name: "", email: "", message: "" });
      setSending(false);
    }, 500);
  };

  return (
    <SiteShell>
      <section className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-4xl md:text-5xl font-extrabold">Contact us</h1>
        <p className="mt-4 text-muted-foreground">Have a question or an opportunity? Drop us a line.</p>
        <div className="mt-8 grid gap-8 md:grid-cols-[1fr_260px]">
          <form onSubmit={submit} className="space-y-4">
            <div><Label htmlFor="name">Name</Label><Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div><Label htmlFor="message">Message</Label><Textarea id="message" rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></div>
            <Button type="submit" disabled={sending} className="bg-brand text-brand-foreground">{sending ? "Sending..." : "Send message"}</Button>
          </form>
          <aside className="space-y-4">
            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-center gap-2 font-semibold"><Mail className="h-4 w-4 text-brand" /> Email</div>
              <p className="mt-1 text-sm text-muted-foreground">hello@digitalgoodsmart.com</p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-center gap-2 font-semibold"><MessageSquare className="h-4 w-4 text-brand" /> Response time</div>
              <p className="mt-1 text-sm text-muted-foreground">Usually within 24 hours.</p>
            </div>
          </aside>
        </div>
      </section>
    </SiteShell>
  );
}
