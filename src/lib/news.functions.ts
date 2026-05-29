import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type NewsItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  cover_url: string | null;
  published_at: string | null;
  created_at: string;
};

export const getLatestNews = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from("news")
      .select("id, slug, title, excerpt, category, cover_url, published_at")
      .not("published_at", "is", null)
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false })
      .limit(4);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getAllPublishedNews = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from("news")
      .select("id, slug, title, excerpt, category, cover_url, published_at")
      .not("published_at", "is", null)
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getNewsBySlug = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) =>
    z.object({ slug: z.string().min(1).max(200) }).parse(input)
  )
  .handler(async ({ data }) => {
    const { data: row, error } = await supabaseAdmin
      .from("news")
      .select("*")
      .eq("slug", data.slug)
      .not("published_at", "is", null)
      .lte("published_at", new Date().toISOString())
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row as NewsItem | null;
  });

export const getAllNewsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from("news")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });


const newsInputSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, "Solo lettere minuscole, numeri e trattini"),
  title: z.string().min(1).max(200),
  excerpt: z.string().min(1).max(500),
  body: z.string().min(1).max(20000),
  category: z.string().min(1).max(80),
  cover_url: z.string().url().max(500).optional().or(z.literal("")),
  published_at: z.string().nullable().optional(),
});

export const upsertNews = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => newsInputSchema.parse(input))
  .handler(async ({ data }) => {
    const payload = {
      slug: data.slug,
      title: data.title,
      excerpt: data.excerpt,
      body: data.body,
      category: data.category,
      cover_url: data.cover_url || null,
      published_at: data.published_at || null,
    };

    if (data.id) {
      const { error } = await supabaseAdmin
        .from("news")
        .update(payload)
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    } else {
      const { data: row, error } = await supabaseAdmin
        .from("news")
        .insert(payload)
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      return { id: row.id };
    }
  });


export const deleteNews = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) =>
    z.object({ id: z.string().uuid() }).parse(input)
  )
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("news").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });


export const submitContact = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      name: z.string().min(1).max(200),
      email: z.string().email().max(320),
      subject: z.string().max(200).optional(),
      message: z.string().min(1).max(5000),
    }).parse(input)
  )
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("contact_submissions").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const submitMembership = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      company_name: z.string().min(1).max(200),
      contact_name: z.string().min(1).max(200),
      email: z.string().email().max(320),
      phone: z.string().max(50).optional(),
      product_category: z.string().max(200).optional(),
      message: z.string().max(2000).optional(),
    }).parse(input)
  )
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("membership_requests").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    return { isAdmin: true };
  });

