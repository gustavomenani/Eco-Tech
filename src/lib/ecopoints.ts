import type { Ecopoint, MaterialCatalogItem } from "@/lib/types";

export type EcopointFilters = {
  query: string;
  type: "all" | Ecopoint["type"];
  city: string;
  material: string;
};

export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function materialLabelMap(materials: MaterialCatalogItem[]) {
  return new Map(materials.map((item) => [item.key, item.label]));
}

export function filterEcopoints(points: Ecopoint[], filters: EcopointFilters) {
  const normalizedQuery = normalizeText(filters.query);

  return points.filter((point) => {
    const searchableText = normalizeText(
      [point.name, point.city, point.address, point.hours, point.type, point.materialKeys.join(" ")].join(" ")
    );
    const matchesQuery = !normalizedQuery || searchableText.includes(normalizedQuery);
    const matchesType = filters.type === "all" || point.type === filters.type;
    const matchesCity = filters.city === "all" || point.city === filters.city;
    const matchesMaterial = filters.material === "all" || point.materialKeys.includes(filters.material);

    return matchesQuery && matchesType && matchesCity && matchesMaterial;
  });
}

export function buildOpenStreetMapEmbedUrl(point: Pick<Ecopoint, "lat" | "lon">) {
  const latPadding = 0.012;
  const lonPadding = 0.018;
  const left = (point.lon - lonPadding).toFixed(6);
  const bottom = (point.lat - latPadding).toFixed(6);
  const right = (point.lon + lonPadding).toFixed(6);
  const top = (point.lat + latPadding).toFixed(6);
  const marker = `${point.lat.toFixed(6)}%2C${point.lon.toFixed(6)}`;

  return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${marker}`;
}

export function buildSchematicPoints(points: Ecopoint[]) {
  if (points.length === 0) {
    return [];
  }

  const latitudes = points.map((point) => point.lat);
  const longitudes = points.map((point) => point.lon);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLon = Math.min(...longitudes);
  const maxLon = Math.max(...longitudes);
  const latRange = Math.max(maxLat - minLat, 0.0001);
  const lonRange = Math.max(maxLon - minLon, 0.0001);

  return points.map((point) => ({
    ...point,
    markerX: 12 + ((point.lon - minLon) / lonRange) * 76,
    markerY: 12 + ((maxLat - point.lat) / latRange) * 76
  }));
}
