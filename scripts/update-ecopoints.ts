import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ecopointsDocumentSchema, ecopointsGeoDocumentSchema } from "@/lib/schemas";
import type { EcopointsDocument, EcopointsGeoDocument, GeoPoint, MaterialCatalogItem } from "@/lib/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const sourceUrl = "https://aracatuba.sp.gov.br/sustentabilidade";
const outputPath = path.join(rootDir, "src", "data", "ecopontos-aracatuba.json");
const geoPath = path.join(rootDir, "src", "data", "ecopoints-geo.json");

export const materialsCatalog: MaterialCatalogItem[] = [
  { key: "entulho", label: "Entulho" },
  { key: "madeira", label: "Madeira" },
  { key: "plastico", label: "Plástico" },
  { key: "metal", label: "Metal" },
  { key: "vidro", label: "Vidro" },
  { key: "papel-papelao", label: "Papel e papelão" },
  { key: "moveis", label: "Móveis" },
  { key: "eletrodomesticos", label: "Eletrodomésticos" },
  { key: "lampadas", label: "Lâmpadas" },
  { key: "baterias-domesticas", label: "Baterias domésticas" },
  { key: "restos-verdes", label: "Capina, jardinagem e poda" }
];

const ptBrMonths = [
  "",
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro"
];

const namedEntities: Record<string, string> = {
  nbsp: " ",
  amp: "&",
  quot: '"',
  apos: "'",
  ndash: "–",
  mdash: "—",
  rsquo: "’",
  lsquo: "‘",
  aacute: "á",
  acirc: "â",
  atilde: "ã",
  ccedil: "ç",
  eacute: "é",
  ecirc: "ê",
  iacute: "í",
  oacute: "ó",
  ocirc: "ô",
  otilde: "õ",
  uacute: "ú",
  Aacute: "Á",
  Acirc: "Â",
  Atilde: "Ã",
  Ccedil: "Ç",
  Eacute: "É",
  Ecirc: "Ê",
  Iacute: "Í",
  Oacute: "Ó",
  Ocirc: "Ô",
  Otilde: "Õ",
  Uacute: "Ú"
};

export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/gi, " ")
    .toLowerCase()
    .trim();
}

export function formatPtBrDate(date: Date) {
  return `${date.getDate()} de ${ptBrMonths[date.getMonth() + 1]} de ${date.getFullYear()}`;
}

export function formatIsoLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function decodeHtmlEntities(value: string) {
  return value
    .replace(/&#(\d+);/g, (_, numeric) => String.fromCodePoint(Number(numeric)))
    .replace(/&#x([\da-f]+);/gi, (_, hexadecimal) => String.fromCodePoint(Number.parseInt(hexadecimal, 16)))
    .replace(/&([a-zA-Z]+);/g, (fullMatch, entity) => namedEntities[entity] ?? fullMatch);
}

export function extractTextLines(html: string) {
  const withoutScripts = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|section|article|header|footer|main|aside|nav|li|ul|ol|h1|h2|h3|h4|h5|h6)>/gi, "\n")
    .replace(/<[^>]+>/g, "");

  return decodeHtmlEntities(withoutScripts)
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function findLineIndex(lines: string[], value: string, start = 0, occurrence = 1) {
  let seen = 0;

  for (let index = start; index < lines.length; index += 1) {
    if (lines[index] === value) {
      seen += 1;

      if (seen === occurrence) {
        return index;
      }
    }
  }

  throw new Error(`Trecho não encontrado na fonte oficial: ${value}`);
}

function extractSection(lines: string[], startValue: string, endValue: string, startOccurrence = 1) {
  const startIndex = findLineIndex(lines, startValue, 0, startOccurrence) + 1;
  const endIndex = findLineIndex(lines, endValue, startIndex);

  return lines.slice(startIndex, endIndex);
}

export function materialKeysFromText(text: string) {
  const normalized = normalizeText(text);
  const patterns: Array<[MaterialCatalogItem["key"], string[]]> = [
    ["entulho", ["entulho"]],
    ["madeira", ["madeira"]],
    ["plastico", ["plastico"]],
    ["metal", ["metal", "metais"]],
    ["vidro", ["vidro"]],
    ["papel-papelao", ["papel e papelao"]],
    ["moveis", ["moveis"]],
    ["eletrodomesticos", ["eletrodomesticos"]],
    ["lampadas", ["lampadas"]],
    ["baterias-domesticas", ["baterias domesticas"]],
    ["restos-verdes", ["restos de capina", "jardinagem", "poda de arvores"]]
  ];

  return patterns.flatMap(([key, aliases]) => (aliases.some((alias) => normalized.includes(alias)) ? [key] : []));
}

export function buildMapsUrl(address: string, city = "Araçatuba-SP") {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${address}, ${city}`)}`;
}

function geoLookupByAlias(geoDocument: EcopointsGeoDocument) {
  const entries = new Map<string, GeoPoint>();

  for (const point of geoDocument.points) {
    for (const alias of point.aliases) {
      entries.set(normalizeText(alias), point);
    }
  }

  return entries;
}

function matchGeo(name: string, lookup: Map<string, GeoPoint>) {
  const geo = lookup.get(normalizeText(name));

  if (!geo) {
    throw new Error(`Coordenadas não encontradas para "${name}". Atualize src/data/ecopoints-geo.json.`);
  }

  return geo;
}

function requireNonEmptyLine(lines: string[], index: number, description: string) {
  const value = lines[index]?.trim();

  if (!value) {
    throw new Error(`Não foi possível identificar ${description}.`);
  }

  return value;
}

function parseEcopoints(sectionLines: string[], lookup: Map<string, GeoPoint>) {
  const materialsIndex = findLineIndex(sectionLines, "O que levar a um ecoponto");
  const hoursIndex = findLineIndex(sectionLines, "Horário de atendimento", materialsIndex);
  const materialsText = requireNonEmptyLine(sectionLines, materialsIndex + 1, "os materiais aceitos dos ecopontos");
  const hoursText = requireNonEmptyLine(sectionLines, hoursIndex + 1, "o horário de atendimento dos ecopontos");
  const pointLines = sectionLines.slice(0, materialsIndex);
  const points: EcopointsDocument["points"] = [];

  for (let index = 0; index < pointLines.length; index += 1) {
    const name = pointLines[index];

    if (!name.startsWith("Ecoponto ")) {
      continue;
    }

    const rawAddress = requireNonEmptyLine(pointLines, index + 1, `o endereço de ${name}`);
    const address = `${rawAddress.replace(/\.$/, "")}.`;
    const geo = matchGeo(name, lookup);

    points.push({
      id: geo.id,
      type: "ecoponto",
      city: "Araçatuba-SP",
      name,
      address,
      materialKeys: materialKeysFromText(materialsText),
      hours: `${hoursText.replace(/\.$/, "")}.`,
      mapsUrl: buildMapsUrl(address, "Araçatuba-SP"),
      lat: geo.lat,
      lon: geo.lon
    });

    index += 1;
  }

  return points;
}

function parsePev(sectionLines: string[], lookup: Map<string, GeoPoint>) {
  const name = "PEV da Secretaria Municipal de Meio Ambiente e Sustentabilidade";
  const geo = matchGeo(name, lookup);
  const rawLine = requireNonEmptyLine(sectionLines, 0, "o endereço do PEV");
  const address = `${rawLine.trim().replace(/\.$/, "")}.`;
  const materialsLine = sectionLines.find((line) => line.startsWith("O que levar a um PEV:"));

  if (!materialsLine) {
    throw new Error("Não foi possível identificar os materiais aceitos pelo PEV.");
  }

  return {
    id: geo.id,
    type: "pev" as const,
    city: "Araçatuba-SP",
    name,
    address,
    materialKeys: materialKeysFromText(materialsLine.split(":", 2)[1].trim()),
    hours: "Consulte o atendimento da Secretaria Municipal de Meio Ambiente e Sustentabilidade.",
    mapsUrl: buildMapsUrl(address, "Araçatuba-SP"),
    lat: geo.lat,
    lon: geo.lon
  };
}

export function buildEcopointsDocument(html: string, geoDocument: EcopointsGeoDocument, today = new Date()): EcopointsDocument {
  const lines = extractTextLines(html);
  const lookup = geoLookupByAlias(geoDocument);
  const ecopointsSection = extractSection(lines, "ECOPONTOS", "COLETA SELETIVA", 2);
  const pevSection = extractSection(lines, "PONTOS DE ENTREGA VOLUNTÁRIA (PEV)", "CENTRO DE TRATAMENTO DE RESÍDUOS (CTR)", 2);
  const points = parseEcopoints(ecopointsSection, lookup);

  points.push(parsePev(pevSection, lookup));

  return ecopointsDocumentSchema.parse({
    city: "Araçatuba-SP",
    sourceName: "Prefeitura de Araçatuba",
    sourceUrl,
    sources: [
      {
        name: "Prefeitura de Araçatuba",
        url: sourceUrl,
        note: "Fonte oficial usada na atualização automática dos ecopontos."
      }
    ],
    consultedAt: formatIsoLocalDate(today),
    consultedAtDisplay: formatPtBrDate(today),
    materialsCatalog,
    points
  });
}

export async function syncEcopoints({
  loadHtml,
  loadGeo,
  saveDocument,
  today = new Date()
}: {
  loadHtml: () => Promise<string>;
  loadGeo: () => Promise<EcopointsGeoDocument>;
  saveDocument: (document: EcopointsDocument) => Promise<void>;
  today?: Date;
}) {
  const html = await loadHtml();
  const geo = await loadGeo();
  const document = buildEcopointsDocument(html, geo, today);
  await saveDocument(document);

  return document;
}

async function loadGeoDocument() {
  const raw = JSON.parse(await readFile(geoPath, "utf8"));
  return ecopointsGeoDocumentSchema.parse(raw);
}

async function saveOutput(document: EcopointsDocument) {
  await writeFile(outputPath, `${JSON.stringify(document, null, 2)}\n`, "utf8");
}

async function main() {
  try {
    const document = await syncEcopoints({
      loadHtml: async () => {
        const response = await fetch(sourceUrl);

        if (!response.ok) {
          throw new Error(`Falha ao consultar a fonte oficial: ${response.status} ${response.statusText}`);
        }

        return response.text();
      },
      loadGeo: loadGeoDocument,
      saveDocument: saveOutput
    });

    console.log(`Ecopontos atualizados a partir de ${document.sourceUrl}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido ao atualizar os ecopontos.";
    console.error(message);
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  void main();
}
