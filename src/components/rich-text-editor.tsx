import { useEffect, useCallback } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";

import Youtube from "@tiptap/extension-youtube";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MediaPicker } from "@/components/media-picker";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Heading1, Heading2, Heading3, Heading4, Heading5, Heading6,
  List, ListOrdered, Quote, Code2, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Link as LinkIcon, Image as ImageIcon, Youtube as YoutubeIcon, Table as TableIcon,
  Minus, Palette, Highlighter, Undo2, Redo2, MousePointerClick,
} from "lucide-react";

const COLORS = ["#000000", "#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899", "#64748b", "#ffffff"];

function Btn({ onClick, active, disabled, title, children }: { onClick: () => void; active?: boolean; disabled?: boolean; title: string; children: React.ReactNode }) {
  return (
    <Button
      type="button" variant="ghost" size="sm" title={title} disabled={disabled}
      onClick={onClick}
      className={`h-8 w-8 p-0 ${active ? "bg-accent text-accent-foreground" : ""}`}
    >{children}</Button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const insertLink = useCallback(() => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL", prev ?? "https://");
    if (url === null) return;
    if (url === "") { editor.chain().focus().extendMarkRange("link").unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url, target: "_blank" }).run();
  }, [editor]);

  const insertButton = () => {
    const label = window.prompt("Button label", "Click here"); if (!label) return;
    const url = window.prompt("Button URL", "https://"); if (!url) return;
    editor.chain().focus().insertContent(
      `<p><a href="${url}" target="_blank" rel="noopener" class="inline-block rounded-md bg-brand text-brand-foreground px-4 py-2 font-semibold no-underline">${label}</a></p>`
    ).run();
  };

  const insertYT = () => {
    const url = window.prompt("YouTube URL"); if (!url) return;
    editor.chain().focus().setYoutubeVideo({ src: url, width: 640, height: 360 }).run();
  };

  const insertTable = () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();

  const sep = <span className="mx-1 h-6 w-px bg-border" />;

  return (
    <div className="flex flex-wrap items-center gap-1 border-b bg-muted/50 p-2 sticky top-0 z-10">
      <Btn title="Undo" onClick={() => editor.chain().focus().undo().run()}><Undo2 className="h-4 w-4" /></Btn>
      <Btn title="Redo" onClick={() => editor.chain().focus().redo().run()}><Redo2 className="h-4 w-4" /></Btn>
      {sep}
      <Btn title="H1" active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}><Heading1 className="h-4 w-4" /></Btn>
      <Btn title="H2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 className="h-4 w-4" /></Btn>
      <Btn title="H3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 className="h-4 w-4" /></Btn>
      <Btn title="H4" active={editor.isActive("heading", { level: 4 })} onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}><Heading4 className="h-4 w-4" /></Btn>
      <Btn title="H5" active={editor.isActive("heading", { level: 5 })} onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}><Heading5 className="h-4 w-4" /></Btn>
      <Btn title="H6" active={editor.isActive("heading", { level: 6 })} onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}><Heading6 className="h-4 w-4" /></Btn>
      {sep}
      <Btn title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="h-4 w-4" /></Btn>
      <Btn title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="h-4 w-4" /></Btn>
      <Btn title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon className="h-4 w-4" /></Btn>
      <Btn title="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough className="h-4 w-4" /></Btn>
      {sep}
      <Btn title="Align left" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}><AlignLeft className="h-4 w-4" /></Btn>
      <Btn title="Align center" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}><AlignCenter className="h-4 w-4" /></Btn>
      <Btn title="Align right" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}><AlignRight className="h-4 w-4" /></Btn>
      <Btn title="Justify" active={editor.isActive({ textAlign: "justify" })} onClick={() => editor.chain().focus().setTextAlign("justify").run()}><AlignJustify className="h-4 w-4" /></Btn>
      {sep}
      <Btn title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><List className="h-4 w-4" /></Btn>
      <Btn title="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className="h-4 w-4" /></Btn>
      <Btn title="Blockquote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote className="h-4 w-4" /></Btn>
      <Btn title="Code block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}><Code2 className="h-4 w-4" /></Btn>
      {sep}
      <Popover>
        <PopoverTrigger asChild><Button type="button" variant="ghost" size="sm" title="Text color" className="h-8 w-8 p-0"><Palette className="h-4 w-4" /></Button></PopoverTrigger>
        <PopoverContent className="w-auto p-2"><div className="grid grid-cols-6 gap-1">
          {COLORS.map((c) => <button key={c} type="button" className="h-6 w-6 rounded border" style={{ background: c }} onClick={() => editor.chain().focus().setColor(c).run()} />)}
          <button type="button" className="col-span-6 text-xs mt-1 underline" onClick={() => editor.chain().focus().unsetColor().run()}>Clear color</button>
        </div></PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild><Button type="button" variant="ghost" size="sm" title="Highlight" className="h-8 w-8 p-0"><Highlighter className="h-4 w-4" /></Button></PopoverTrigger>
        <PopoverContent className="w-auto p-2"><div className="grid grid-cols-6 gap-1">
          {COLORS.map((c) => <button key={c} type="button" className="h-6 w-6 rounded border" style={{ background: c }} onClick={() => editor.chain().focus().toggleHighlight({ color: c }).run()} />)}
          <button type="button" className="col-span-6 text-xs mt-1 underline" onClick={() => editor.chain().focus().unsetHighlight().run()}>Clear</button>
        </div></PopoverContent>
      </Popover>
      {sep}
      <Btn title="Link" active={editor.isActive("link")} onClick={insertLink}><LinkIcon className="h-4 w-4" /></Btn>
      <MediaPicker
        onSelect={(url) => editor.chain().focus().setImage({ src: url }).run()}
        trigger={<Button type="button" variant="ghost" size="sm" title="Image" className="h-8 w-8 p-0"><ImageIcon className="h-4 w-4" /></Button>}
      />
      <Btn title="YouTube" onClick={insertYT}><YoutubeIcon className="h-4 w-4" /></Btn>
      <Btn title="Table" onClick={insertTable}><TableIcon className="h-4 w-4" /></Btn>
      <Btn title="Button" onClick={insertButton}><MousePointerClick className="h-4 w-4" /></Btn>
      <Btn title="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus className="h-4 w-4" /></Btn>
    </div>
  );
}

export function RichTextEditor({ value, onChange, placeholder }: { value: string; onChange: (html: string) => void; placeholder?: string }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4, 5, 6] } }),
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener", target: "_blank" } }),
      Image,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Table.configure({ resizable: true }),
      TableRow, TableCell, TableHeader,
      Youtube.configure({ controls: true, nocookie: true }),
      Placeholder.configure({ placeholder: placeholder ?? "Start writing your post…" }),
    ],
    content: value || "",
    editorProps: {
      attributes: { class: "prose-content min-h-[400px] max-h-[70vh] overflow-auto p-4 focus:outline-none" },
      handleDrop: (view, event) => {
        const files = Array.from(event.dataTransfer?.files ?? []).filter((f) => f.type.startsWith("image/"));
        if (!files.length) return false;
        event.preventDefault();
        import("@/lib/media").then(async ({ uploadMedia }) => {
          for (const f of files) {
            try {
              const m = await uploadMedia(f);
              editor?.chain().focus().setImage({ src: m.url }).run();
            } catch {/* ignore */}
          }
        });
        return true;
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) editor.commands.setContent(value || "", { emitUpdate: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value === "" ? "" : undefined]);

  if (!editor) return null;

  return (
    <div className="rounded-md border bg-background overflow-hidden">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
