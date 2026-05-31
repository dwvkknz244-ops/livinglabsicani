import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { imageOverridesQueryOptions } from "@/lib/images.queries";
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
  const setFn = useServerFn(setImageOverride);
  const fileRef = useRef<HTMLInputElement>(null);
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const [uploading, setUploading] = useState(false);

  const effectiveSrc = overridesQ.data?.[imageKey];
  const isAdmin = hasSession;
  const portalTarget = typeof document === "undefined" ? null : document.body;

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
    e.stopPropagation();
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
      <span
        onContextMenu={onContext}
        data-editable-key={imageKey}
        style={{ ...(uploading ? { opacity: 0.5 } : {}), cursor: isAdmin ? "context-menu" : undefined }}
        className={className}
        title={isAdmin ? "Click destro per sostituire il logo" : undefined}
      >
        {effectiveSrc ? (
          <img src={effectiveSrc} alt="Logo" className="h-8 w-auto object-contain" />
        ) : (
          children
        )}
      </span>
      {portalTarget &&
        createPortal(
          <>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ position: "fixed", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
              onClick={(e) => e.stopPropagation()}
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
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    fileRef.current?.click();
                    setMenu(null);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-surface flex items-center gap-2"
                >
                  <Upload size={14} className="text-accent" />
                  Sostituisci logo
                </button>
              </div>
            )}
          </>,
          portalTarget,
        )}
    </>
  );
}
