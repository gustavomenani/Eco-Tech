from __future__ import annotations

import json
import re
import ssl
import sys
import unicodedata
from datetime import date
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import URLError
from urllib.parse import quote_plus
from urllib.request import urlopen


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "src" / "data"
OUTPUT_PATH = DATA_DIR / "ecopontos-aracatuba.json"
GEO_PATH = DATA_DIR / "ecopoints-geo.json"
SOURCE_URL = "https://aracatuba.sp.gov.br/sustentabilidade"

MATERIALS_CATALOG = [
    {"key": "entulho", "label": "Entulho"},
    {"key": "madeira", "label": "Madeira"},
    {"key": "plastico", "label": "Plástico"},
    {"key": "metal", "label": "Metal"},
    {"key": "vidro", "label": "Vidro"},
    {"key": "papel-papelao", "label": "Papel e papelão"},
    {"key": "moveis", "label": "Móveis"},
    {"key": "eletrodomesticos", "label": "Eletrodomésticos"},
    {"key": "lampadas", "label": "Lâmpadas"},
    {"key": "baterias-domesticas", "label": "Baterias domésticas"},
    {"key": "restos-verdes", "label": "Capina, jardinagem e poda"},
]

PT_BR_MONTHS = {
    1: "janeiro",
    2: "fevereiro",
    3: "março",
    4: "abril",
    5: "maio",
    6: "junho",
    7: "julho",
    8: "agosto",
    9: "setembro",
    10: "outubro",
    11: "novembro",
    12: "dezembro",
}


class TextExtractor(HTMLParser):
    BLOCK_TAGS = {
        "p",
        "div",
        "section",
        "article",
        "header",
        "footer",
        "main",
        "aside",
        "nav",
        "li",
        "ul",
        "ol",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
    }

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.parts: list[str] = []
        self.skip_depth = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag in {"script", "style"}:
            self.skip_depth += 1
            return
        if self.skip_depth:
            return
        if tag == "br":
            self.parts.append("\n")

    def handle_endtag(self, tag: str) -> None:
        if tag in {"script", "style"} and self.skip_depth:
            self.skip_depth -= 1
            return
        if self.skip_depth:
            return
        if tag in self.BLOCK_TAGS:
            self.parts.append("\n")

    def handle_data(self, data: str) -> None:
        if self.skip_depth:
            return
        self.parts.append(data)

    def lines(self) -> list[str]:
        text = "".join(self.parts)
        normalized_lines = []
        for raw_line in text.splitlines():
            line = re.sub(r"\s+", " ", raw_line).strip()
            if line:
                normalized_lines.append(line)
        return normalized_lines


def normalize_text(value: str) -> str:
    normalized = unicodedata.normalize("NFD", value)
    normalized = "".join(char for char in normalized if unicodedata.category(char) != "Mn")
    normalized = re.sub(r"[^a-z0-9]+", " ", normalized.lower())
    return normalized.strip()


def format_pt_br_date(today: date) -> str:
    return f"{today.day} de {PT_BR_MONTHS[today.month]} de {today.year}"


def build_maps_url(address: str) -> str:
    query = quote_plus(f"{address}, Araçatuba - SP")
    return f"https://www.google.com/maps/search/?api=1&query={query}"


def load_geo_lookup() -> dict[str, dict[str, float | str]]:
    payload = json.loads(GEO_PATH.read_text(encoding="utf-8"))
    lookup: dict[str, dict[str, float | str]] = {}

    for point in payload["points"]:
        point_meta = {
            "id": point["id"],
            "lat": point["lat"],
            "lon": point["lon"],
        }
        for alias in point["aliases"]:
            lookup[normalize_text(alias)] = point_meta

    return lookup


def fetch_source_lines() -> list[str]:
    try:
        with urlopen(SOURCE_URL) as response:
            html = response.read().decode("utf-8", errors="ignore")
    except URLError as exc:
        reason = getattr(exc, "reason", None)
        if not isinstance(reason, ssl.SSLCertVerificationError):
            raise

        print(
            "Aviso: falha na validação do certificado local; tentando leitura em modo de compatibilidade.",
            file=sys.stderr,
        )
        insecure_context = ssl._create_unverified_context()
        with urlopen(SOURCE_URL, context=insecure_context) as response:
            html = response.read().decode("utf-8", errors="ignore")

    extractor = TextExtractor()
    extractor.feed(html)
    extractor.close()
    return extractor.lines()


def find_line_index(lines: list[str], value: str, start: int = 0, occurrence: int = 1) -> int:
    seen = 0
    for index in range(start, len(lines)):
        if lines[index] == value:
            seen += 1
            if seen == occurrence:
                return index
    raise RuntimeError(f"Trecho não encontrado na fonte oficial: {value}")


def extract_section(lines: list[str], start_value: str, end_value: str, start_occurrence: int = 1) -> list[str]:
    start_index = find_line_index(lines, start_value, occurrence=start_occurrence) + 1
    end_index = find_line_index(lines, end_value, start_index)
    return lines[start_index:end_index]


def material_keys_from_text(text: str) -> list[str]:
    normalized = normalize_text(text)
    keys = []
    patterns = [
        ("entulho", ["entulho"]),
        ("madeira", ["madeira"]),
        ("plastico", ["plastico"]),
        ("metal", ["metal", "metais"]),
        ("vidro", ["vidro"]),
        ("papel-papelao", ["papel e papelao"]),
        ("moveis", ["moveis"]),
        ("eletrodomesticos", ["eletrodomesticos"]),
        ("lampadas", ["lampadas"]),
        ("baterias-domesticas", ["baterias domesticas"]),
        ("restos-verdes", ["restos de capina", "jardinagem", "poda de arvores"]),
    ]

    for key, aliases in patterns:
        if any(alias in normalized for alias in aliases):
            keys.append(key)

    return keys


def match_geo(name: str, geo_lookup: dict[str, dict[str, float | str]]) -> dict[str, float | str]:
    normalized_name = normalize_text(name)
    if normalized_name not in geo_lookup:
        raise RuntimeError(
            f"Coordenadas não encontradas para '{name}'. "
            "Adicione o alias correspondente em src/data/ecopoints-geo.json."
        )
    return geo_lookup[normalized_name]


def parse_ecopoints(section_lines: list[str], geo_lookup: dict[str, dict[str, float | str]]) -> list[dict[str, object]]:
    materials_marker = "O que levar a um ecoponto"
    hours_marker = "Horário de atendimento"
    materials_index = find_line_index(section_lines, materials_marker)
    hours_index = find_line_index(section_lines, hours_marker, materials_index)

    materials_text = section_lines[materials_index + 1]
    hours_text = section_lines[hours_index + 1]
    point_lines = section_lines[:materials_index]

    points = []
    index = 0
    while index < len(point_lines):
        name = point_lines[index]
        if not name.startswith("Ecoponto "):
            index += 1
            continue
        if index + 1 >= len(point_lines):
            raise RuntimeError(f"Endereço ausente para {name} na fonte oficial.")
        address = point_lines[index + 1].rstrip(".") + "."
        geo = match_geo(name, geo_lookup)
        points.append(
            {
                "id": geo["id"],
                "type": "ecoponto",
                "name": name,
                "address": address,
                "materialKeys": material_keys_from_text(materials_text),
                "hours": hours_text.rstrip(".") + ".",
                "mapsUrl": build_maps_url(address),
                "lat": geo["lat"],
                "lon": geo["lon"],
            }
        )
        index += 2

    return points


def parse_pev(section_lines: list[str], geo_lookup: dict[str, dict[str, float | str]]) -> dict[str, object]:
    raw_line = section_lines[0]
    if "–" in raw_line:
        _, raw_address = [part.strip() for part in raw_line.split("–", 1)]
    else:
        raw_address = raw_line.strip()

    address = raw_address.rstrip(".") + "."
    materials_line = next(
        line for line in section_lines if line.startswith("O que levar a um PEV:")
    )
    materials_text = materials_line.split(":", 1)[1].strip()
    name = "PEV da Secretaria Municipal de Meio Ambiente e Sustentabilidade"
    geo = match_geo(name, geo_lookup)

    return {
        "id": geo["id"],
        "type": "pev",
        "name": name,
        "address": address,
        "materialKeys": material_keys_from_text(materials_text),
        "hours": "Consulte o atendimento da Secretaria Municipal de Meio Ambiente e Sustentabilidade.",
        "mapsUrl": build_maps_url(address),
        "lat": geo["lat"],
        "lon": geo["lon"],
    }


def main() -> None:
    today = date.today()
    geo_lookup = load_geo_lookup()
    lines = fetch_source_lines()

    ecopoints_section = extract_section(lines, "ECOPONTOS", "COLETA SELETIVA", start_occurrence=2)
    pev_section = extract_section(lines, "PONTOS DE ENTREGA VOLUNTÁRIA (PEV)", "CENTRO DE TRATAMENTO DE RESÍDUOS (CTR)", start_occurrence=2)

    points = parse_ecopoints(ecopoints_section, geo_lookup)
    points.append(parse_pev(pev_section, geo_lookup))

    payload = {
        "city": "Araçatuba-SP",
        "sourceName": "Prefeitura de Araçatuba",
        "sourceUrl": SOURCE_URL,
        "consultedAt": today.isoformat(),
        "consultedAtDisplay": format_pt_br_date(today),
        "materialsCatalog": MATERIALS_CATALOG,
        "points": points,
    }

    OUTPUT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Ecopontos atualizados a partir de {SOURCE_URL}")


if __name__ == "__main__":
    main()
