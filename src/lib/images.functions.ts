import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getImageOverrides = createServerFn({ method: "GET" }).handler(
  async () => {
    const { data, error } = await supabaseAdmin
      .from("image_overrides")
      .select("key, url");
    if (error) throw new Error(error.message);
    const map: Record<string, string> = {};
    for (const row of data ?? []) map[row.key] = row.url;
    return map;
  },
);

export const setImageOverride = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        key: z.string().min(1).max(120).regex(/^[a-zA-Z0-9_\-:.]+$/),
        url: z.string().url().max(1000),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: roleData } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleData) throw new Error("Forbidden");

    const { error } = await supabaseAdmin
      .from("image_overrides")
      .upsert({ key: data.key, url: data.url, updated_at: new Date().toISOString() });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
