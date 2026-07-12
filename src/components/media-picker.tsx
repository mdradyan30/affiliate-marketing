import { useCallback, useEffect, useState, type DragEvent } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { UploadCloud, Loader2, ImageIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { listMedia, uploadMedia, deleteMedia, type MediaItem } from "@/lib/media";

export function MediaPicker({
  trigger,
  onSelect,
  title = "Insert media",
}: {
  trigger: React.ReactNode;
  onSelect: (url: string) => void;
  title?: string;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [drag, setDrag] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setItems(await listMedia());
    setLoading(false);
  }, []);

  useEffect(() => { if (open) refresh(); }, [open, refresh]);

  const doUpload = async (files: FileList | File[]) => {
    setUploading(true);
    try {
      for (const f of Array.from(files)) {
        if (!f.type.startsWith("image/")) { toast.error(`${f.name} is not an image`); continue; }
        await uploadMedia(f);
      }
      toast.success("Uploaded");
      await refresh();
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally { setUploading(false); }
  };

  const onDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setDrag(false);
    if (e.dataTransfer.files.length) await doUpload(e.dataTransfer.files);
  };

  const pick = (url: string) => { onSelect(url); setOpen(false); };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <Tabs defaultValue="upload" className="flex flex-col overflow-hidden">
          <TabsList>
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="library">Library</TabsTrigger>
            <TabsTrigger value="url">From URL</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-4">
            <div
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={onDrop}
              className={`rounded-xl border-2 border-dashed p-10 text-center transition ${drag ? "border-brand bg-brand/5" : "border-border bg-muted/30"}`}
            >
              <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 font-medium">Drag & drop images here</p>
              <p className="text-sm text-muted-foreground">or</p>
              <label className="mt-3 inline-flex">
                <input type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files && doUpload(e.target.files)} />
                <Button type="button" variant="outline" asChild><span>{uploading ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Uploading</> : "Choose files"}</span></Button>
              </label>
            </div>
          </TabsContent>

          <TabsContent value="library" className="mt-4 overflow-auto">
            {loading ? (
              <div className="py-10 text-center text-muted-foreground"><Loader2 className="inline h-5 w-5 animate-spin" /></div>
            ) : items.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground"><ImageIcon className="mx-auto h-8 w-8" /><p className="mt-2">No media yet</p></div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3 max-h-[50vh] overflow-auto p-1">
                {items.map((m) => (
                  <div key={m.path} className="group relative aspect-square rounded-lg border overflow-hidden bg-muted">
                    <button type="button" onClick={() => pick(m.url)} className="absolute inset-0">
                      <img src={m.url} alt={m.name} className="h-full w-full object-cover transition group-hover:scale-105" />
                    </button>
                    <button
                      type="button"
                      onClick={async () => { await deleteMedia(m.path); toast.success("Deleted"); refresh(); }}
                      className="absolute top-1 right-1 rounded bg-background/80 p-1 opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="url" className="mt-4 space-y-3">
            <Input placeholder="https://..." value={urlInput} onChange={(e) => setUrlInput(e.target.value)} />
            <Button type="button" onClick={() => urlInput && pick(urlInput)} disabled={!urlInput}>Insert URL</Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
