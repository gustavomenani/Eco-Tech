import { describe, expect, it } from "vitest";
import { getEcopointsDocument } from "@/lib/data";
import { buildOpenStreetMapEmbedUrl, filterEcopoints, normalizeText } from "@/lib/ecopoints";

describe("ecopoints helpers", () => {
  const document = getEcopointsDocument();

  it("normalizes accents and casing", () => {
    expect(normalizeText("Aviação")).toBe("aviacao");
  });

  it("filters points by query, type and material", () => {
    const result = filterEcopoints(document.points, {
      query: "aviação",
      type: "pev",
      city: "all",
      material: "lampadas"
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("pev-secretaria-meio-ambiente");
  });

  it("builds OpenStreetMap embed URLs with bbox and marker", () => {
    const point = document.points[0];
    const url = buildOpenStreetMapEmbedUrl(point);

    expect(url).toContain("openstreetmap.org/export/embed.html");
    expect(url).toContain("marker=");
  });
});
