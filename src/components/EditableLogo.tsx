import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { imageOverridesQueryOptions } from "@/lib/images.queries";
import { isAdminQueryOptions } from "@/lib/news.queries";
import { setImageOverride } from "@/lib/images.functions";

type Props = {
  imageKey: string;
  children: React.ReactNode;
  className?: string;
};

export function EditableLogo({ imageKey, children, className }: Props) {
  const qc = useQueryClient();
  const overridesQ = useQuery(imageOverridesQueryOptions);
  const [hasSession, setHasSession] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setHasSession(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setHasSession(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);
  const isAdminQ = useQuery({ ...isAdminQueryOptions, enabled: hasSession, retry: false });
  const setFn = useServerFn(setImageOverride);
  const fileRef = useRef<HTMLInputElement>(null);
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const [uploading, setUploading] = useState(false);

  const effectiveSrc = overridesQ.data?.[imageKey];
  const isAdmin = isAdminQ.data?.isAdmin === true;

  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(null);
    window.addEventListener("click", close);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [menu]);

  const upload = useMutation({
    mutationFn: async (file: File) => {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${imageKey}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("site-images")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (error) throw error;
      const { data: pub } = supabase.storage.from("site-images").getPublicUrl(path);
      await setFn({ data: { key: imageKey, url: pub.publicUrl } });
      return pub.publicUrl;
    },
    onSuccess: () => {
      toast.success("Logo sostituito");
      qc.invalidateQueries({ queryKey: ["image-overrides"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Errore upload"),
    onSettled: () => setUploading(false),
  });

  function onContext(e: React.MouseEvent) {
    if (!isAdmin) return;
    e.preventDefault();
    setMenu({ x: e.clientX, y: e.clientY });
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      toast.error("File troppo grande (max 10 MB)");
      return;
    }
    setUploading(true);
    upload.mutate(f);
  }

  return (
    <>
      <span className="relative inline-flex items-center">
        <span
          onContextMenu={onContext}
          data-editable-key={imageKey}
          style={uploading ? { opacity: 0.5 } : undefined}
          className={className}
        >
          {effectiveSrc ? (
            <img src={effectiveSrc} alt="Logo" className="h-8 w-auto object-contain" />
          ) : (
            children
          )}
        </span>
        {isAdmin && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              fileRef.current?.click();
            }}
            title="Sostituisci logo"
            className="ml-2 inline-flex items-center gap-1 rounded-md bg-accent/10 text-accent px-2 py-1 text-[10px] font-medium ring-1 ring-accent/30 hover:bg-accent/20"
          >
            <Upload size={11} />
            Logo
          </button>
        )}
      </span>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFile}
      />
      {menu && (
        <div
          style={{ position: "fixed", top: menu.y, left: menu.x, zIndex: 9999 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-background ring-1 ring-foreground/10 shadow-xl rounded-xl py-1.5 min-w-[180px]"
        >
          <button
            type="button"
            onClick={() => {
              setMenu(null);
              fileRef.current?.click();
            }}
            className="w-full text-left px-3 py-2 text-sm hover:bg-surface flex items-center gap-2"
          >
            <Upload size={14} className="text-accent" />
            Sostituisci logo
          </button>
        </div>
      )}
    </>
  );
}

