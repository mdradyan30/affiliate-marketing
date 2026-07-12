import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Bold, Italic, List, ListOrdered, Quote, Code, Link as LinkIcon, Image as ImageIcon, Heading1, Heading2, Heading3, Minus, Youtube } from "lucide-react";
import { renderMarkdown } from "@/lib/markdown";

export function MarkdownEditor({ value, onChange, rows = 20 }: { value: string; onChange: (v: string) => void; rows?: number }) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const wrap = (before: string, after = before) => {
    const el = ref.current; if (!el) return;
    const start = el.selectionStart, end = el.selectionEnd;
    const sel = value.slice(start, end);
    const next = value.slice(0, start) + before + sel + after + value.slice(end);
    onChange(next);
    setTimeout(() => { el.focus(); el.selectionStart = start + before.length; el.selectionEnd = end + before.length; }, 0);
  };

  const prefixLines = (prefix: string) => {
    const el = ref.current; if (!el) return;
    const start = el.selectionStart, end = el.selectionEnd;
    const before = value.slice(0, start);
    const sel = value.slice(start, end) || "text";
    const after = value.slice(end);
    const newSel = sel.split("\n").map((l) => `${prefix}${l}`).join("\n");
    onChange(before + newSel + after);
  };

  const insert = (text: string) => {
    const el = ref.current; if (!el) return;
    const start = el.selectionStart;
    onChange(value.slice(0, start) + text + value.slice(start));
  };

  const insertLink = () => {
    const url = prompt("URL:", "https://"); if (!url) return;
    wrap("[", `](${url})`);
  };
  const insertImage = () => {
    const url = prompt("Image URL:", "https://"); if (!url) return;
    insert(`\n![Image](${url})\n`);
  };
  const insertYouTube = () => {
    const url = prompt("YouTube URL:"); if (!url) return;
    const m = url.match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([\w-]{11})/);
    if (!m) return alert("Not a valid YouTube URL");
    insert(`\n<iframe src="https://www.youtube.com/embed/${m[1]}" width="100%" height="400" frameborder="0" allowfullscreen></iframe>\n`);
  };

  const btn = "h-8 w-8 p-0";

  return (
    <div className="rounded-md border bg-background">
      <div className="flex flex-wrap gap-1 border-b p-2 bg-muted/50">
        <Button type="button" variant="ghost" size="sm" className={btn} onClick={() => prefixLines("# ")}><Heading1 className="h-4 w-4" /></Button>
        <Button type="button" variant="ghost" size="sm" className={btn} onClick={() => prefixLines("## ")}><Heading2 className="h-4 w-4" /></Button>
        <Button type="button" variant="ghost" size="sm" className={btn} onClick={() => prefixLines("### ")}><Heading3 className="h-4 w-4" /></Button>
        <span className="w-px bg-border mx-1" />
        <Button type="button" variant="ghost" size="sm" className={btn} onClick={() => wrap("**")}><Bold className="h-4 w-4" /></Button>
        <Button type="button" variant="ghost" size="sm" className={btn} onClick={() => wrap("*")}><Italic className="h-4 w-4" /></Button>
        <Button type="button" variant="ghost" size="sm" className={btn} onClick={() => wrap("~~")}><span className="text-xs line-through">S</span></Button>
        <span className="w-px bg-border mx-1" />
        <Button type="button" variant="ghost" size="sm" className={btn} onClick={() => prefixLines("- ")}><List className="h-4 w-4" /></Button>
        <Button type="button" variant="ghost" size="sm" className={btn} onClick={() => prefixLines("1. ")}><ListOrdered className="h-4 w-4" /></Button>
        <Button type="button" variant="ghost" size="sm" className={btn} onClick={() => prefixLines("> ")}><Quote className="h-4 w-4" /></Button>
        <Button type="button" variant="ghost" size="sm" className={btn} onClick={() => wrap("`")}><Code className="h-4 w-4" /></Button>
        <span className="w-px bg-border mx-1" />
        <Button type="button" variant="ghost" size="sm" className={btn} onClick={insertLink}><LinkIcon className="h-4 w-4" /></Button>
        <Button type="button" variant="ghost" size="sm" className={btn} onClick={insertImage}><ImageIcon className="h-4 w-4" /></Button>
        <Button type="button" variant="ghost" size="sm" className={btn} onClick={insertYouTube}><Youtube className="h-4 w-4" /></Button>
        <Button type="button" variant="ghost" size="sm" className={btn} onClick={() => insert("\n---\n")}><Minus className="h-4 w-4" /></Button>
      </div>
      <div className="grid md:grid-cols-2 gap-0 divide-x">
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className="p-3 font-mono text-sm resize-y outline-none bg-background w-full min-h-[400px]"
          placeholder="Write your post in **Markdown**..."
        />
        <div className="p-3 prose-content overflow-auto max-h-[600px] bg-card" dangerouslySetInnerHTML={{ __html: renderMarkdown(value || "*Nothing to preview*") }} />
      </div>
    </div>
  );
}
