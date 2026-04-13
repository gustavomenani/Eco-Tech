import { describe, expect, it } from "vitest";
import { getResourceById } from "@/lib/data";
import { buildSchematicPoints } from "@/lib/ecopoints";
import { ecopointsDocumentSchema, resourcesDocumentSchema, siteConfigSchema } from "@/lib/schemas";
import ecopointsDocument from "@/data/ecopontos-aracatuba.json";
import resourcesDocument from "@/data/resources.json";
import siteConfig from "@/data/site.config.json";

describe("data helpers", () => {
  it("retrieves a known resource by id", () => {
    expect(getResourceById("oswaldo-cruz").url).toContain("oswaldocruz.br");
  });

  it("throws for unknown resource ids", () => {
    expect(() => getResourceById("unknown-resource")).toThrow(/Recurso desconhecido/);
  });

  it("returns no schematic points for an empty list", () => {
    expect(buildSchematicPoints([])).toEqual([]);
  });

  it("rejects ecopoints with unknown material keys", () => {
    const invalidDocument = {
      ...ecopointsDocument,
      points: [
        {
          ...ecopointsDocument.points[0],
          materialKeys: [...ecopointsDocument.points[0].materialKeys, "material-inexistente"]
        }
      ]
    };

    expect(() => ecopointsDocumentSchema.parse(invalidDocument)).toThrow(/Material desconhecido/);
  });

  it("rejects resource documents with unknown ids in curated lists", () => {
    const invalidDocument = {
      ...resourcesDocument,
      homeResourceIds: [...resourcesDocument.homeResourceIds, "nao-existe"]
    };

    expect(() => resourcesDocumentSchema.parse(invalidDocument)).toThrow(/Recurso desconhecido/);
  });

  it("rejects duplicate resource ids", () => {
    const invalidDocument = {
      ...resourcesDocument,
      items: [...resourcesDocument.items, resourcesDocument.items[0]]
    };

    expect(() => resourcesDocumentSchema.parse(invalidDocument)).toThrow(/ID de recurso duplicado/);
  });

  it("rejects duplicate nav links in site config", () => {
    const invalidConfig = {
      ...siteConfig,
      nav: [...siteConfig.nav, siteConfig.nav[0]]
    };

    expect(() => siteConfigSchema.parse(invalidConfig)).toThrow(/Link de navegação duplicado/);
  });
});
