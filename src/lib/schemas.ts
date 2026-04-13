import { z } from "zod";

function addDuplicateIssue<T>({
  ctx,
  entries,
  getKey,
  getPath,
  label
}: {
  ctx: z.RefinementCtx;
  entries: T[];
  getKey: (entry: T) => string;
  getPath: (index: number) => (string | number)[];
  label: string;
}) {
  const seen = new Map<string, number>();

  entries.forEach((entry, index) => {
    const key = getKey(entry);
    const firstIndex = seen.get(key);

    if (firstIndex !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${label} duplicado: ${key}.`,
        path: getPath(index)
      });
      return;
    }

    seen.set(key, index);
  });
}

export const navItemSchema = z.object({
  href: z.string().min(1),
  label: z.string().min(1)
});

export const pageSeoSchema = z.object({
  path: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  schemaType: z.string().min(1)
});

export const siteConfigSchema = z
  .object({
    siteName: z.string().min(1),
    organizationName: z.string().min(1),
    author: z.string().min(1),
    siteUrl: z.string().url(),
    language: z.string().min(1),
    themeColor: z.string().min(1),
    backgroundColor: z.string().min(1),
    socialImage: z.string().min(1),
    socialImageAlt: z.string().min(1),
    twitterCard: z.enum(["summary", "summary_large_image"]),
    footerDescription: z.string().min(1),
    footerNote: z.string().min(1),
    manifestDescription: z.string().min(1),
    nav: z.array(navItemSchema).min(1),
    pages: z.array(pageSeoSchema).min(1)
  })
  .superRefine((config, ctx) => {
    addDuplicateIssue({
      ctx,
      entries: config.nav,
      getKey: (item) => item.href,
      getPath: (index) => ["nav", index, "href"],
      label: "Link de navegação"
    });
    addDuplicateIssue({
      ctx,
      entries: config.pages,
      getKey: (page) => page.path,
      getPath: (index) => ["pages", index, "path"],
      label: "Página SEO"
    });
  });

export const materialCatalogItemSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1)
});

export const ecopointsSourceSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  note: z.string().min(1).optional()
});

export const ecopointSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["ecoponto", "pev"]),
  city: z.string().min(1),
  name: z.string().min(1),
  address: z.string().min(1),
  materialKeys: z.array(z.string().min(1)).min(1),
  hours: z.string().min(1),
  mapsUrl: z.string().url(),
  lat: z.number(),
  lon: z.number()
});

export const ecopointsDocumentSchema = z
  .object({
    city: z.string().min(1),
    sourceName: z.string().min(1),
    sourceUrl: z.string().url(),
    sources: z.array(ecopointsSourceSchema).min(1),
    consultedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    consultedAtDisplay: z.string().min(1),
    materialsCatalog: z.array(materialCatalogItemSchema).min(1),
    points: z.array(ecopointSchema).min(1)
  })
  .superRefine((document, ctx) => {
    addDuplicateIssue({
      ctx,
      entries: document.materialsCatalog,
      getKey: (item) => item.key,
      getPath: (index) => ["materialsCatalog", index, "key"],
      label: "Chave de material"
    });
    addDuplicateIssue({
      ctx,
      entries: document.points,
      getKey: (point) => point.id,
      getPath: (index) => ["points", index, "id"],
      label: "ID de ecoponto"
    });
    const materialKeys = new Set(document.materialsCatalog.map((item) => item.key));

    document.points.forEach((point, pointIndex) => {
      point.materialKeys.forEach((materialKey, materialIndex) => {
        if (!materialKeys.has(materialKey)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Material desconhecido no ponto ${point.id}: ${materialKey}.`,
            path: ["points", pointIndex, "materialKeys", materialIndex]
          });
        }
      });
    });
  });

export const resourceContextSchema = z.object({
  badge: z.string().min(1),
  title: z.string().min(1),
  kicker: z.string().min(1),
  description: z.string().min(1).optional(),
  featured: z.boolean().optional()
});

export const resourceItemSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(["article", "video"]),
  cta: z.string().min(1),
  url: z.string().url(),
  media: z.object({
    src: z.string().min(1),
    alt: z.string().min(1),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    label: z.string().min(1)
  }),
  home: resourceContextSchema,
  sources: resourceContextSchema
});

export const sourcePanelSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  url: z.string().url(),
  cta: z.string().min(1)
});

export const resourcesDocumentSchema = z
  .object({
    consultedAtDisplay: z.string().min(1),
    homeResourceIds: z.array(z.string().min(1)).min(1),
    homeSpotlightIds: z.array(z.string().min(1)).min(1),
    sourcesFeaturedIds: z.array(z.string().min(1)).min(1),
    sourcesVideoIds: z.array(z.string().min(1)).min(1),
    sourcePanels: z.array(sourcePanelSchema).min(1),
    items: z.array(resourceItemSchema).min(1)
  })
  .superRefine((document, ctx) => {
    addDuplicateIssue({
      ctx,
      entries: document.items,
      getKey: (item) => item.id,
      getPath: (index) => ["items", index, "id"],
      label: "ID de recurso"
    });
    addDuplicateIssue({
      ctx,
      entries: document.sourcePanels,
      getKey: (panel) => panel.url.trim().toLowerCase(),
      getPath: (index) => ["sourcePanels", index, "url"],
      label: "URL de painel de fonte"
    });
    const validIds = new Set(document.items.map((item) => item.id));
    const idGroups: Array<[string, string[]]> = [
      ["homeResourceIds", document.homeResourceIds],
      ["homeSpotlightIds", document.homeSpotlightIds],
      ["sourcesFeaturedIds", document.sourcesFeaturedIds],
      ["sourcesVideoIds", document.sourcesVideoIds]
    ];

    idGroups.forEach(([field, ids]) => {
      ids.forEach((id, index) => {
        if (!validIds.has(id)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Recurso desconhecido em ${field}: ${id}.`,
            path: [field, index]
          });
        }
      });
    });
  });

export const geoPointSchema = z.object({
  id: z.string().min(1),
  lat: z.number(),
  lon: z.number(),
  aliases: z.array(z.string().min(1)).min(1)
});

export const ecopointsGeoDocumentSchema = z.object({
  points: z.array(geoPointSchema).min(1)
});
