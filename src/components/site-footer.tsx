import { Link } from "@tanstack/react-router";
import { Facebook, Twitter, Linkedin, Youtube } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t bg-card mt-16">
      <div className="mx-auto max-w-7xl px-4 py-12 grid gap-8 md:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Digital Goods Mart" className="h-10 w-10 object-contain" />
            <span className="font-extrabold text-brand">Digital Goods Mart</span>
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">
            In-depth reviews of software, AI tools, design tools and money-making products from an affiliate marketer you can trust.
          </p>
        </div>

        <div>
          <h4 className="font-bold text-sm mb-3">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-foreground">About</Link></li>
            <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
            <li><Link to="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-foreground">Terms &amp; Conditions</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-sm mb-3">Categories</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/blog" search={{ category: "software" }} className="hover:text-foreground">Software</Link></li>
            <li><Link to="/blog" search={{ category: "ai-tools" }} className="hover:text-foreground">AI Tools</Link></li>
            <li><Link to="/blog" search={{ category: "design-tools" }} className="hover:text-foreground">Design Tools</Link></li>
            <li><Link to="/blog" search={{ category: "mmo" }} className="hover:text-foreground">MMO</Link></li>
            <li><Link to="/blog" search={{ category: "health" }} className="hover:text-foreground">Health</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-sm mb-3">Follow us</h4>
          <div className="flex gap-3">
            <a href="#" aria-label="Facebook" className="h-9 w-9 rounded-full bg-accent grid place-items-center hover:bg-brand hover:text-brand-foreground transition-colors"><Facebook className="h-4 w-4" /></a>
            <a href="#" aria-label="Twitter" className="h-9 w-9 rounded-full bg-accent grid place-items-center hover:bg-brand hover:text-brand-foreground transition-colors"><Twitter className="h-4 w-4" /></a>
            <a href="#" aria-label="LinkedIn" className="h-9 w-9 rounded-full bg-accent grid place-items-center hover:bg-brand hover:text-brand-foreground transition-colors"><Linkedin className="h-4 w-4" /></a>
            <a href="#" aria-label="YouTube" className="h-9 w-9 rounded-full bg-accent grid place-items-center hover:bg-brand hover:text-brand-foreground transition-colors"><Youtube className="h-4 w-4" /></a>
          </div>
        </div>
      </div>
      <div className="border-t">
        <div className="mx-auto max-w-7xl px-4 py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Digital Goods Mart. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
