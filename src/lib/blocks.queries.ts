import { queryOptions } from "@tanstack/react-query";
import { getPageBlocks, getPageBlocksAdmin } from "./blocks.functions";

export const pageBlocksQueryOptions = (page: string) =>
  queryOptions({
    queryKey: ["page-blocks", page],
    queryFn: () => getPageBlocks({ data: { page } }),
  });

export const pageBlocksAdminQueryOptions = (page: string) =>
  queryOptions({
    queryKey: ["page-blocks-admin", page],
    queryFn: () => getPageBlocksAdmin({ data: { page } }),
  });

export const PAGES: { id: string; label: string }[] = [
  { id: "chi-siamo", label: "Chi siamo" },
  { id: "servizi", label: "Servizi" },
  { id: "partecipa", label: "Partecipa" },
  { id: "contatti", label: "Contatti" },
  { id: "home", label: "Home" },
];
