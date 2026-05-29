import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type PageBlock = {
  id: string;
  page: string;
  sort_order: number;
  type: "text" | "image" | "cta" | "stat";
  title: string | null;
  body: string | null;
  image_url: string | null;
  image_alt: string | null;
  cta_label: string | null;
  cta_href: string | null;
  visible: boolean;
};

const PAGE_RE = /^[a-z0-9-]+$/;

async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const { data } = await ctx.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", ctx.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Forbidden");
}

export const getPageBlocks = createServerFn({ method: "GET" })
  .inputValidator((input: { page: string }) =>
    z.object({ page: z.string().min(1).max(60).regex(PAGE_RE) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { data: rows, error } = await supabaseAdmin
      .from("page_blocks")
      .select("*")
      .eq("page", data.page)
      .eq("visible", true)
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return (rows ?? []) as PageBlock[];
  });

export const getPageBlocksAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { page: string }) =>
    z.object({ page: z.string().min(1).max(60).regex(PAGE_RE) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { data: rows, error } = await supabaseAdmin
      .from("page_blocks")
      .select("*")
      .eq("page", data.page)
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return (rows ?? []) as PageBlock[];
  });

const blockSchema = z.object({
  id: z.string().uuid().optional(),
  page: z.string().min(1).max(60).regex(PAGE_RE),
  sort_order: z.number().int().min(0).max(100000),
  type: z.enum(["text", "image", "cta", "stat"]),
  title: z.string().max(300).nullable().optional(),
  body: z.string().max(10000).nullable().optional(),
  image_url: z.string().url().max(1000).nullable().optional().or(z.literal("")),
  image_alt: z.string().max(300).nullable().optional(),
  cta_label: z.string().max(120).nullable().optional(),
  cta_href: z.string().max(500).refine(
    (v) => !v || /^(https?:\/\/|\/|#|mailto:|tel:)/i.test(v),
    { message: "Only http(s), mailto, tel, or relative paths allowed" },
  ).nullable().optional(),
  visible: z.boolean().optional(),
});

export const upsertPageBlock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => blockSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const payload = {
      page: data.page,
      sort_order: data.sort_order,
      type: data.type,
      title: data.title || null,
      body: data.body || null,
      image_url: data.image_url || null,
      image_alt: data.image_alt || null,
      cta_label: data.cta_label || null,
      cta_href: data.cta_href || null,
      visible: data.visible ?? true,
    };
    if (data.id) {
      const { error } = await supabaseAdmin.from("page_blocks").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await supabaseAdmin
      .from("page_blocks")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const deletePageBlock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) =>
    z.object({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await supabaseAdmin.from("page_blocks").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const reorderPageBlock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; sort_order: number }) =>
    z.object({ id: z.string().uuid(), sort_order: z.number().int().min(0).max(100000) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await supabaseAdmin
      .from("page_blocks")
      .update({ sort_order: data.sort_order })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
