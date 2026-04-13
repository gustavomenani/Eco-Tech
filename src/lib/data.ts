import { cache } from "react";
import rawEcopointsGeo from "@/data/ecopoints-geo.json";
import rawEcopoints from "@/data/ecopontos-aracatuba.json";
import rawResources from "@/data/resources.json";
import rawSiteConfig from "@/data/site.config.json";
import {
  ecopointsDocumentSchema,
  ecopointsGeoDocumentSchema,
  resourcesDocumentSchema,
  siteConfigSchema
} from "@/lib/schemas";
import type { PageSeo, ResourceItem } from "@/lib/types";

export const getSiteConfig = cache(() => siteConfigSchema.parse(rawSiteConfig));
export const getEcopointsDocument = cache(() => ecopointsDocumentSchema.parse(rawEcopoints));
export const getEcopointsGeoDocument = cache(() => ecopointsGeoDocumentSchema.parse(rawEcopointsGeo));
export const getResourcesDocument = cache(() => resourcesDocumentSchema.parse(rawResources));

export const getPageSeo = cache((path: string): PageSeo => {
  const page = getSiteConfig().pages.find((item) => item.path === path);

  if (!page) {
    throw new Error(`SEO metadata ausente para a rota ${path}.`);
  }

  return page;
});

export const getResourceMap = cache(() => {
  const items = getResourcesDocument().items;
  return new Map(items.map((item) => [item.id, item]));
});

export function getResourceById(id: string): ResourceItem {
  const resource = getResourceMap().get(id);

  if (!resource) {
    throw new Error(`Recurso desconhecido: ${id}`);
  }

  return resource;
}

export function getResourcesByIds(ids: string[]): ResourceItem[] {
  return ids.map((id) => getResourceById(id));
}
