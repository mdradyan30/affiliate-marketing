import { useEffect, useCallback, useRef, useState } from "react";
import { useEditor, EditorContent, NodeViewWrapper, ReactNodeViewRenderer, type Editor, type NodeViewProps } from "@tiptap/react";
import { Node } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
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

function normalizeImageWidth(width: unknown): string {
  if (typeof width === "string" && width.trim()) return width.trim();
  return "100%";
}

function getPercentValue(width: unknown): number {
  if (typeof width !== "string") return 100;
  const match = width.trim().match(/^(\d+(?:\.\d+)?)%$/);
  if (!match) return 100;
  return Math.min(100, Math.max(10, Number(match[1])));
}

const CustomImage = Node.create({
  name: "image",
  group: "block",
  selectable: true,
  draggable: true,
  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      width: { default: "100%" },
      height: { default: null },
      link: { default: null },
    };
  },
  parseHTML() {
    return [{
      tag: "img[src]",
      getAttrs: (element) => {
        const src = element.getAttribute("src");
        if (!src) return false;
        const parent = element.parentElement;
        const link = parent?.tagName === "A" ? parent.getAttribute("href") : null;
        const widthFromStyle = element.getAttribute("style")?.match(/width:\s*([^;]+)/i)?.[1]?.trim();
        const width = widthFromStyle || element.getAttribute("width") || "100%";
        return {
          src,
          alt: element.getAttribute("alt"),
          title: element.getAttribute("title"),
          width,
          link,
        };
      },
    }];
  },
  renderHTML({ node }) {
    const { src, alt, title, width, height, link } = node.attrs;
    const widthValue = normalizeImageWidth(width);
    const style = widthValue ? `width: ${widthValue}; max-width: 100%; height: auto;` : undefined;
    const imageAttrs = { src, alt: alt ?? "", title: title ?? undefined, ...(style ? { style } : {}), ...(height ? { height } : {}) };

    if (link) {
      return ["a", { href: link, target: "_blank", rel: "noopener noreferrer" }, ["img", imageAttrs]];
    }

    return ["img", imageAttrs];
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView);
  },
});

function ImageNodeView(props: NodeViewProps) {
  const { node, selected, updateAttributes, deleteNode, editor, getPos } = props;
  const [resizing, setResizing] = useState(false);
  const startRef = useRef<{ x: number; widthPercent: number } | null>(null);
  const width = normalizeImageWidth(node.attrs.width);
  const widthPercent = getPercentValue(width);

  const selectNode = useCallback(() => {
    const pos = getPos?.();
    if (typeof pos === "number") {
      editor.commands.setNodeSelection(pos);
    }
  }, [editor, getPos]);

  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    startRef.current = { x: event.clientX, widthPercent };
    setResizing(true);
  }, [widthPercent]);

  useEffect(() => {
    if (!resizing) return;

    const onMove = (event: MouseEvent) => {
      if (!startRef.current) return;
      const deltaPercent = ((event.clientX - startRef.current.x) / 320) * 100;
      const nextPercent = Math.max(10, Math.min(100, startRef.current.widthPercent + deltaPercent));
      updateAttributes({ width: `${Math.round(nextPercent)}%` });
    };

    const onUp = () => {
      startRef.current = null;
      setResizing(false);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [resizing, updateAttributes]);

  return (
    <NodeViewWrapper as="div" className={`my-5 flex justify-center ${selected ? "is-selected" : ""}`}>
      <div className={`relative inline-flex max-w-full ${selected ? "rounded-xl ring-2 ring-brand" : ""}`} onClick={selectNode}>
        <button
          type="button"
          className="absolute bottom-2 right-2 z-10 rounded-full border border-border bg-background/90 p-1 shadow-sm"
          title="Resize image"
          onMouseDown={handleMouseDown}
          onClick={(event) => event.stopPropagation()}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 22L14 14M22 22V14M22 22H14" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <div className="block max-w-full" onClick={(event) => {
          event.stopPropagation();
          selectNode();
        }}>
          <img
            src={node.attrs.src}
            alt={node.attrs.alt ?? ""}
            title={node.attrs.title ?? undefined}
            className={`max-w-full h-auto rounded-lg border ${selected ? "border-brand" : "border-transparent"}`}
            style={{ width, maxWidth: "100%" }}
          />
        </div>
        {selected && (
          <div className="absolute left-2 top-2 rounded bg-background/90 px-2 py-1 text-[11px] text-muted-foreground shadow-sm">
            Image selected
          </div>
        )}
      </div>
      {selected && (
        <div className="ml-2 flex flex-col gap-1">
          <div className="rounded border bg-background p-2 text-xs">
            <div className="mb-1 text-[11px] font-medium">Image width</div>
            <input type="range" min="10" max="100" step="1" value={widthPercent} onChange={(event) => updateAttributes({ width: `${event.target.value}%` })} className="w-full accent-brand" />
            <div className="mt-1 flex items-center gap-2">
              <input type="number" min="10" max="100" step="1" value={widthPercent} onChange={(event) => updateAttributes({ width: `${event.target.value}%` })} className="w-14 rounded border px-1 py-0.5" />
              <span>%</span>
            </div>
          </div>
          <button type="button" className="rounded border bg-background px-2 py-1 text-xs" onClick={() => deleteNode()}>Remove</button>
        </div>
      )}
    </NodeViewWrapper>
  );
}

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
  const promptValue = useCallback((message: string, defaultValue = "") => {
    return new Promise<string | null>((resolve) => {
      const runPrompt = () => resolve(window.prompt(message, defaultValue));
      if (typeof window !== "undefined") {
        window.requestAnimationFrame(runPrompt);
      } else {
        resolve(null);
      }
    });
  }, []);

  const insertLink = useCallback(async () => {
    const currentSelection = editor.state.selection as { node?: { type?: { name?: string }; attrs?: { link?: string | null } } };
    const selectedImage = currentSelection.node?.type?.name === "image" ? currentSelection.node : null;

    if (selectedImage) {
      const prev = selectedImage.attrs?.link ?? "";
      const url = await promptValue("URL", prev || "https://");
      if (url === null) return;
      if (url === "") {
        editor.chain().focus().updateAttributes("image", { link: null }).run();
        return;
      }
      editor.chain().focus().updateAttributes("image", { link: url }).run();
      return;
    }

    const prev = editor.getAttributes("link").href as string | undefined;
    const url = await promptValue("URL", prev ?? "https://");
    if (url === null) return;
    if (url === "") { editor.chain().focus().extendMarkRange("link").unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url, target: "_blank" }).run();
  }, [editor, promptValue]);

  const insertButton = async () => {
    const label = await promptValue("Button label", "Click here"); if (!label) return;
    const url = await promptValue("Button URL", "https://"); if (!url) return;
    editor.chain().focus().insertContent(
      `<p><a href="${url}" target="_blank" rel="noopener" class="inline-block rounded-md bg-brand text-brand-foreground px-4 py-2 font-semibold no-underline">${label}</a></p>`
    ).run();
  };

  const insertYT = async () => {
    const url = await promptValue("YouTube URL"); if (!url) return;
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
      <Btn title="Link" active={editor.isActive("link") || editor.isActive("image")} onClick={() => { void insertLink(); }}><LinkIcon className="h-4 w-4" /></Btn>
      <MediaPicker
        onSelect={(url) => editor.chain().focus().insertContent({ type: "image", attrs: { src: url, width: "100%" } }).run()}
        trigger={<Button type="button" variant="ghost" size="sm" title="Image" className="h-8 w-8 p-0"><ImageIcon className="h-4 w-4" /></Button>}
      />
      <Btn title="YouTube" onClick={() => { void insertYT(); }}><YoutubeIcon className="h-4 w-4" /></Btn>
      <Btn title="Table" onClick={insertTable}><TableIcon className="h-4 w-4" /></Btn>
      <Btn title="Button" onClick={() => { void insertButton(); }}><MousePointerClick className="h-4 w-4" /></Btn>
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
      CustomImage,
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
              editor?.chain().focus().insertContent({ type: "image", attrs: { src: m.url, width: "100%" } }).run();
            } catch {/* ignore */ }
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
