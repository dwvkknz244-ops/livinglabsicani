import { queryOptions } from "@tanstack/react-query";
import {
  getLatestNews,
  getAllPublishedNews,
  getNewsBySlug,
  getAllNewsAdmin,
  checkIsAdmin,
} from "./news.functions";

export const latestNewsQueryOptions = queryOptions({
  queryKey: ["news", "latest"],
  queryFn: () => getLatestNews(),
});

export const allNewsQueryOptions = queryOptions({
  queryKey: ["news", "all"],
  queryFn: () => getAllPublishedNews(),
});

export const newsBySlugQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["news", "slug", slug],
    queryFn: () => getNewsBySlug({ data: { slug } }),
  });

export const adminNewsQueryOptions = queryOptions({
  queryKey: ["news", "admin", "all"],
  queryFn: () => getAllNewsAdmin(),
});

export const isAdminQueryOptions = queryOptions({
  queryKey: ["auth", "isAdmin"],
  queryFn: () => checkIsAdmin(),
});
