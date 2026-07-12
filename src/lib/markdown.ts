import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

marked.setOptions({ gfm: true, breaks: true });

const SANITIZE = {
  ADD_TAGS: ["iframe"],
  ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling", "target", "rel", "style", "class", "colspan", "rowspan"],
};

export function renderMarkdown(md: string): string {
  return DOMPurify.sanitize(marked.parse(md ?? "", { async: false }) as string, SANITIZE);
}

/** Render either sanitized HTML (from the rich editor) or markdown (legacy). */
export function renderContent(input: string): string {
  const s = (input ?? "").trim();
  if (!s) return "";
  // Detect HTML: presence of a block-level tag suggests it's already HTML from TipTap.
  if (/^\s*<(?:p|h[1-6]|ul|ol|blockquote|pre|table|figure|div|hr|img|iframe)\b/i.test(s)) {
    return DOMPurify.sanitize(s, SANITIZE);
  }
  return renderMarkdown(s);
}
