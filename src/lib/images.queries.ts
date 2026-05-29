import { queryOptions } from "@tanstack/react-query";
import { getImageOverrides } from "./images.functions";

export const imageOverridesQueryOptions = queryOptions({
  queryKey: ["image-overrides"],
  queryFn: () => getImageOverrides(),
  staleTime: 60_000,
});
