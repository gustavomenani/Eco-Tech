from __future__ import annotations

import json
import re
from html.parser import HTMLParser
from pathlib import Path

import build_site


ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"
PAGES_DIR = SRC / "pages"
DATA_DIR = SRC / "data"
DIST = ROOT / "dist"
SKIP_TARGET_PREFIXES = ("http:", "https:", "mailto:", "tel:", "data:", "javascript:", "#")


def normalize_local_target(target: str) -> str | None:
    cleaned = target.strip().strip('"').strip("'")
    if not cleaned or cleaned.startswith(SKIP_TARGET_PREFIXES):
        return None
    return cleaned.split("#", 1)[0].split("?", 1)[0]


def resolve_local_target(base_path: Path, target: str) -> Path | None:
    normalized = normalize_local_target(target)
    if not normalized:
        return None
    return (base_path.parent / normalized).resolve()


def load_json_file(path: Path) -> tuple[dict | list | None, list[str]]:
    try:
        return json.loads(path.read_text(encoding="utf-8")), []
    except json.JSONDecodeError as exc:
        return None, [f"{path.name}:{exc.lineno}:{exc.colno} JSON invalido: {exc.msg}."]


def is_non_empty_string(value: object) -> bool:
    return isinstance(value, str) and bool(value.strip())


def is_http_url(value: object) -> bool:
    return isinstance(value, str) and re.match(r"^https?://", value.strip()) is not None


def is_iso_date(value: object) -> bool:
    return isinstance(value, str) and re.match(r"^\d{4}-\d{2}-\d{2}$", value.strip()) is not None


def validate_site_config() -> list[str]:
    path = SRC / "site.config.json"
    payload, errors = load_json_file(path)
    if payload is None:
        return errors
    if not isinstance(payload, dict):
        return [f"{path.name}:1:1 configuracao do site precisa ser um objeto JSON."]

    required_strings = [
        "siteName",
        "organizationName",
        "author",
        "siteUrl",
        "language",
        "themeColor",
        "backgroundColor",
        "socialImage",
        "socialImageAlt",
        "twitterCard",
        "footerDescription",
        "footerNote",
        "manifestDescription",
    ]

    for key in required_strings:
        if not is_non_empty_string(payload.get(key)):
            errors.append(f"{path.name}:1:1 campo obrigatorio ausente ou vazio: {key}.")

    if "siteUrl" in payload and not is_http_url(payload.get("siteUrl")):
        errors.append(f"{path.name}:1:1 siteUrl precisa ser uma URL http/https.")

    social_image = payload.get("socialImage")
    if is_non_empty_string(social_image):
        social_image_path = (SRC / str(social_image)).resolve()
        if not social_image_path.exists():
            errors.append(f"{path.name}:1:1 asset socialImage nao encontrado: {social_image}.")

    pages = payload.get("pages")
    page_paths: set[str] = set()
    if not isinstance(pages, list) or not pages:
        errors.append(f"{path.name}:1:1 pages precisa ser uma lista nao vazia.")
    else:
        for index, page in enumerate(pages):
            label = f"{path.name}:pages[{index}]"
            if not isinstance(page, dict):
                errors.append(f"{label} precisa ser um objeto.")
                continue

            page_path = page.get("path")
            if not is_non_empty_string(page_path):
                errors.append(f"{label} campo obrigatorio ausente ou vazio: path.")
            elif page_path in page_paths:
                errors.append(f"{label} path duplicado: {page_path}.")
            else:
                page_paths.add(str(page_path))
                if not (PAGES_DIR / str(page_path)).exists():
                    errors.append(f"{label} pagina fonte nao encontrada: {page_path}.")

            for key in ("title", "description"):
                if not is_non_empty_string(page.get(key)):
                    errors.append(f"{label} campo obrigatorio ausente ou vazio: {key}.")

    nav = payload.get("nav")
    if not isinstance(nav, list) or not nav:
        errors.append(f"{path.name}:1:1 nav precisa ser uma lista nao vazia.")
    else:
        for index, item in enumerate(nav):
            label = f"{path.name}:nav[{index}]"
            if not isinstance(item, dict):
                errors.append(f"{label} precisa ser um objeto.")
                continue

            href = item.get("href")
            nav_label = item.get("label")
            if not is_non_empty_string(href):
                errors.append(f"{label} campo obrigatorio ausente ou vazio: href.")
            elif page_paths and href not in page_paths:
                errors.append(f"{label} href nao corresponde a nenhuma pagina declarada: {href}.")

            if not is_non_empty_string(nav_label):
                errors.append(f"{label} campo obrigatorio ausente ou vazio: label.")

    return errors


def validate_ecopoints_data() -> list[str]:
    path = DATA_DIR / "ecopontos-aracatuba.json"
    payload, errors = load_json_file(path)
    if payload is None:
        return errors
    if not isinstance(payload, dict):
        return [f"{path.name}:1:1 base de ecopontos precisa ser um objeto JSON."]

    for key in ("city", "sourceName", "sourceUrl", "consultedAt", "consultedAtDisplay"):
        if not is_non_empty_string(payload.get(key)):
            errors.append(f"{path.name}:1:1 campo obrigatorio ausente ou vazio: {key}.")

    if "sourceUrl" in payload and not is_http_url(payload.get("sourceUrl")):
        errors.append(f"{path.name}:1:1 sourceUrl precisa ser uma URL http/https.")

    if "consultedAt" in payload and not is_iso_date(payload.get("consultedAt")):
        errors.append(f"{path.name}:1:1 consultedAt precisa seguir o formato YYYY-MM-DD.")

    catalog = payload.get("materialsCatalog")
    material_keys: set[str] = set()
    if not isinstance(catalog, list) or not catalog:
        errors.append(f"{path.name}:1:1 materialsCatalog precisa ser uma lista nao vazia.")
    else:
        for index, item in enumerate(catalog):
            label = f"{path.name}:materialsCatalog[{index}]"
            if not isinstance(item, dict):
                errors.append(f"{label} precisa ser um objeto.")
                continue

            key = item.get("key")
            material_label = item.get("label")
            if not is_non_empty_string(key):
                errors.append(f"{label} campo obrigatorio ausente ou vazio: key.")
            elif key in material_keys:
                errors.append(f"{label} key duplicada: {key}.")
            else:
                material_keys.add(str(key))

            if not is_non_empty_string(material_label):
                errors.append(f"{label} campo obrigatorio ausente ou vazio: label.")

    points = payload.get("points")
    point_ids: set[str] = set()
    if not isinstance(points, list) or not points:
        errors.append(f"{path.name}:1:1 points precisa ser uma lista nao vazia.")
        return errors

    for index, point in enumerate(points):
        label = f"{path.name}:points[{index}]"
        if not isinstance(point, dict):
            errors.append(f"{label} precisa ser um objeto.")
            continue

        point_id = point.get("id")
        if not is_non_empty_string(point_id):
            errors.append(f"{label} campo obrigatorio ausente ou vazio: id.")
        elif point_id in point_ids:
            errors.append(f"{label} id duplicado: {point_id}.")
        else:
            point_ids.add(str(point_id))

        for key in ("type", "name", "address", "hours", "mapsUrl"):
            if not is_non_empty_string(point.get(key)):
                errors.append(f"{label} campo obrigatorio ausente ou vazio: {key}.")

        if point.get("type") not in {"ecoponto", "pev"}:
            errors.append(f"{label} type invalido: {point.get('type')}.")

        if not isinstance(point.get("lat"), (int, float)):
            errors.append(f"{label} lat precisa ser numerico.")
        if not isinstance(point.get("lon"), (int, float)):
            errors.append(f"{label} lon precisa ser numerico.")

        if "mapsUrl" in point and not is_http_url(point.get("mapsUrl")):
            errors.append(f"{label} mapsUrl precisa ser uma URL http/https.")

        material_keys_for_point = point.get("materialKeys")
        if not isinstance(material_keys_for_point, list) or not material_keys_for_point:
            errors.append(f"{label} materialKeys precisa ser uma lista nao vazia.")
        else:
            invalid_keys = [key for key in material_keys_for_point if key not in material_keys]
            if invalid_keys:
                errors.append(f"{label} materialKeys contem itens fora do catalogo: {', '.join(invalid_keys)}.")

    return errors


def validate_ecopoints_geo_data() -> list[str]:
    path = DATA_DIR / "ecopoints-geo.json"
    payload, errors = load_json_file(path)
    if payload is None:
        return errors
    if not isinstance(payload, dict):
        return [f"{path.name}:1:1 base de coordenadas precisa ser um objeto JSON."]

    points = payload.get("points")
    if not isinstance(points, list) or not points:
        return [f"{path.name}:1:1 points precisa ser uma lista nao vazia."]

    point_ids: set[str] = set()

    for index, point in enumerate(points):
        label = f"{path.name}:points[{index}]"
        if not isinstance(point, dict):
            errors.append(f"{label} precisa ser um objeto.")
            continue

        point_id = point.get("id")
        if not is_non_empty_string(point_id):
            errors.append(f"{label} campo obrigatorio ausente ou vazio: id.")
        elif point_id in point_ids:
            errors.append(f"{label} id duplicado: {point_id}.")
        else:
            point_ids.add(str(point_id))

        if not isinstance(point.get("lat"), (int, float)):
            errors.append(f"{label} lat precisa ser numerico.")
        if not isinstance(point.get("lon"), (int, float)):
            errors.append(f"{label} lon precisa ser numerico.")

        aliases = point.get("aliases")
        if not isinstance(aliases, list) or not aliases:
            errors.append(f"{label} aliases precisa ser uma lista nao vazia.")
            continue

        for alias_index, alias in enumerate(aliases):
            if not is_non_empty_string(alias):
                errors.append(f"{label}.aliases[{alias_index}] precisa ser uma string nao vazia.")

    return errors


def validate_resources_data() -> list[str]:
    path = DATA_DIR / "resources.json"
    payload, errors = load_json_file(path)
    if payload is None:
        return errors
    if not isinstance(payload, dict):
        return [f"{path.name}:1:1 base de recursos precisa ser um objeto JSON."]

    if not is_non_empty_string(payload.get("consultedAtDisplay")):
        errors.append(f"{path.name}:1:1 campo obrigatorio ausente ou vazio: consultedAtDisplay.")

    source_panels = payload.get("sourcePanels")
    if not isinstance(source_panels, list) or not source_panels:
        errors.append(f"{path.name}:1:1 sourcePanels precisa ser uma lista nao vazia.")
    else:
        for index, panel in enumerate(source_panels):
            label = f"{path.name}:sourcePanels[{index}]"
            if not isinstance(panel, dict):
                errors.append(f"{label} precisa ser um objeto.")
                continue
            for key in ("title", "description", "url", "cta"):
                if not is_non_empty_string(panel.get(key)):
                    errors.append(f"{label} campo obrigatorio ausente ou vazio: {key}.")
            if "url" in panel and not is_http_url(panel.get("url")):
                errors.append(f"{label} url precisa ser uma URL http/https.")

    items = payload.get("items")
    item_ids: set[str] = set()
    items_by_id: dict[str, dict] = {}
    if not isinstance(items, list) or not items:
        errors.append(f"{path.name}:1:1 items precisa ser uma lista nao vazia.")
    else:
        for index, item in enumerate(items):
            label = f"{path.name}:items[{index}]"
            if not isinstance(item, dict):
                errors.append(f"{label} precisa ser um objeto.")
                continue

            item_id = item.get("id")
            if not is_non_empty_string(item_id):
                errors.append(f"{label} campo obrigatorio ausente ou vazio: id.")
            elif item_id in item_ids:
                errors.append(f"{label} id duplicado: {item_id}.")
            else:
                item_ids.add(str(item_id))
                items_by_id[str(item_id)] = item

            if item.get("kind") not in {"article", "video"}:
                errors.append(f"{label} kind invalido: {item.get('kind')}.")

            for key in ("cta", "url"):
                if not is_non_empty_string(item.get(key)):
                    errors.append(f"{label} campo obrigatorio ausente ou vazio: {key}.")

            if "url" in item and not is_http_url(item.get("url")):
                errors.append(f"{label} url precisa ser uma URL http/https.")

            media = item.get("media")
            if not isinstance(media, dict):
                errors.append(f"{label} media precisa ser um objeto.")
            else:
                for key in ("src", "alt", "label"):
                    if not is_non_empty_string(media.get(key)):
                        errors.append(f"{label}.media campo obrigatorio ausente ou vazio: {key}.")

                for key in ("width", "height"):
                    value = media.get(key)
                    if not isinstance(value, int) or value <= 0:
                        errors.append(f"{label}.media {key} precisa ser inteiro positivo.")

                media_src = media.get("src")
                if is_non_empty_string(media_src):
                    media_path = (SRC / str(media_src)).resolve()
                    if not media_path.exists():
                        errors.append(f"{label}.media src nao encontrado: {media_src}.")

            for context in ("home", "sources"):
                context_payload = item.get(context)
                if not isinstance(context_payload, dict):
                    errors.append(f"{label} contexto obrigatorio ausente: {context}.")
                    continue

                for key in ("badge", "title", "kicker"):
                    if not is_non_empty_string(context_payload.get(key)):
                        errors.append(f"{label}.{context} campo obrigatorio ausente ou vazio: {key}.")

                description = context_payload.get("description")
                if description is not None and not is_non_empty_string(description):
                    errors.append(f"{label}.{context} description, quando presente, nao pode estar vazia.")

                featured = context_payload.get("featured")
                if featured is not None and not isinstance(featured, bool):
                    errors.append(f"{label}.{context} featured, quando presente, precisa ser booleano.")

    id_lists = {
        "homeResourceIds": None,
        "homeSpotlightIds": "article",
        "sourcesFeaturedIds": "article",
        "sourcesVideoIds": "video",
    }

    for key, expected_kind in id_lists.items():
        values = payload.get(key)
        if not isinstance(values, list) or not values:
            errors.append(f"{path.name}:1:1 {key} precisa ser uma lista nao vazia.")
            continue

        seen_ids: set[str] = set()
        for index, resource_id in enumerate(values):
            label = f"{path.name}:{key}[{index}]"
            if not is_non_empty_string(resource_id):
                errors.append(f"{label} precisa ser um id nao vazio.")
                continue
            if resource_id in seen_ids:
                errors.append(f"{label} id duplicado na lista: {resource_id}.")
                continue
            seen_ids.add(str(resource_id))

            resource = items_by_id.get(str(resource_id))
            if resource is None:
                errors.append(f"{label} referencia item inexistente: {resource_id}.")
                continue

            if expected_kind and resource.get("kind") != expected_kind:
                errors.append(f"{label} precisa apontar para um recurso do tipo {expected_kind}.")

    return errors


def validate_source_data() -> list[str]:
    return [
        *validate_site_config(),
        *validate_ecopoints_data(),
        *validate_ecopoints_geo_data(),
        *validate_resources_data(),
    ]


class SiteHtmlChecker(HTMLParser):
    def __init__(self, path: Path) -> None:
        super().__init__(convert_charrefs=True)
        self.path = path
        self.errors: list[str] = []
        self.has_meta_description = False
        self.ids: set[str] = set()
        self.labels_for: set[str] = set()
        self.pending_controls: list[dict[str, str]] = []
        self.interactive_stack: list[dict[str, object]] = []
        self.label_stack: list[dict[str, object]] = []
        self.in_title = False
        self.title_text: list[str] = []
        self.capture_json_ld = False
        self.current_json_ld: list[str] = []
        self.json_ld_count = 0

    def error(self, message: str) -> None:
        raise RuntimeError(message)

    def location(self) -> str:
        line, column = self.getpos()
        return f"{self.path.name}:{line}:{column + 1}"

    def handle_starttag(self, tag: str, attrs_list: list[tuple[str, str | None]]) -> None:
        attrs = {name: value or "" for name, value in attrs_list}
        location = self.location()

        if tag == "html" and not attrs.get("lang", "").strip():
            self.errors.append(f"{location} html sem atributo lang.")

        if tag == "title":
            self.in_title = True

        if tag == "meta" and attrs.get("name", "").lower() == "description":
            if attrs.get("content", "").strip():
                self.has_meta_description = True
            else:
                self.errors.append(f"{location} meta description vazia.")

        if tag == "img":
            if "alt" not in attrs:
                self.errors.append(f"{location} imagem sem atributo alt.")
            if not attrs.get("width", "").strip() or not attrs.get("height", "").strip():
                self.errors.append(f"{location} imagem sem width/height definidos.")

        element_id = attrs.get("id", "").strip()
        if element_id:
            if element_id in self.ids:
                self.errors.append(f"{location} id duplicado: {element_id}.")
            self.ids.add(element_id)

        if tag == "label":
            label_for = attrs.get("for", "").strip()
            if label_for:
                self.labels_for.add(label_for)
            self.label_stack.append({"for": label_for, "has_control": False, "location": location})

        if tag in {"input", "select", "textarea"}:
            if self.label_stack:
                self.label_stack[-1]["has_control"] = True

            if tag == "input" and attrs.get("type", "").lower() in {"hidden", "submit", "button", "reset", "image"}:
                pass
            else:
                explicit_name = any(attrs.get(name, "").strip() for name in ("aria-label", "aria-labelledby", "title"))
                self.pending_controls.append(
                    {
                        "tag": tag,
                        "id": element_id,
                        "location": location,
                        "explicit_name": "yes" if explicit_name else "",
                    }
                )

        if tag in {"a", "button"}:
            explicit_name = any(attrs.get(name, "").strip() for name in ("aria-label", "aria-labelledby", "title"))
            self.interactive_stack.append(
                {
                    "tag": tag,
                    "location": location,
                    "text": [],
                    "explicit_name": explicit_name,
                }
            )

            if tag == "a" and attrs.get("target") == "_blank":
                rel_tokens = {token.lower() for token in attrs.get("rel", "").split()}
                if not {"noopener", "noreferrer"}.issubset(rel_tokens):
                    self.errors.append(f"{location} link com target=\"_blank\" sem rel=\"noopener noreferrer\".")

            if tag == "button" and not attrs.get("type", "").strip():
                self.errors.append(f"{location} button sem atributo type.")

        if tag == "script" and attrs.get("type") == "application/ld+json":
            self.capture_json_ld = True
            self.current_json_ld = []

    def handle_startendtag(self, tag: str, attrs_list: list[tuple[str, str | None]]) -> None:
        self.handle_starttag(tag, attrs_list)
        self.handle_endtag(tag)

    def handle_endtag(self, tag: str) -> None:
        if tag == "title":
            self.in_title = False

        if tag == "label" and self.label_stack:
            label_info = self.label_stack.pop()
            if not label_info["for"] and not label_info["has_control"]:
                self.errors.append(f"{label_info['location']} label sem atributo for e sem campo associado.")

        if tag in {"a", "button"} and self.interactive_stack:
            item = self.interactive_stack.pop()
            accessible_text = "".join(item["text"]).strip()
            if not item["explicit_name"] and not accessible_text:
                self.errors.append(f"{item['location']} elemento <{item['tag']}> sem nome acessivel.")

        if tag == "script" and self.capture_json_ld:
            payload = "".join(self.current_json_ld).strip()
            if not payload:
                self.errors.append(f"{self.location()} bloco JSON-LD vazio.")
            else:
                try:
                    json.loads(payload)
                except json.JSONDecodeError as exc:
                    self.errors.append(f"{self.path.name}:{exc.lineno}:{exc.colno} JSON-LD invalido: {exc.msg}.")
                else:
                    self.json_ld_count += 1

            self.capture_json_ld = False
            self.current_json_ld = []

    def handle_data(self, data: str) -> None:
        if self.in_title:
            self.title_text.append(data)

        if self.capture_json_ld:
            self.current_json_ld.append(data)

        if self.interactive_stack:
            for item in self.interactive_stack:
                item["text"].append(data)

    def finalize(self) -> list[str]:
        if not "".join(self.title_text).strip():
            self.errors.append(f"{self.path.name}:1:1 pagina sem title valido.")

        if not self.has_meta_description:
            self.errors.append(f"{self.path.name}:1:1 pagina sem meta description.")

        if self.json_ld_count == 0:
            self.errors.append(f"{self.path.name}:1:1 pagina sem bloco JSON-LD.")

        for control in self.pending_controls:
            if control["explicit_name"]:
                continue
            if control["id"] and control["id"] in self.labels_for:
                continue
            self.errors.append(f"{control['location']} campo <{control['tag']}> sem label ou nome acessivel.")

        return self.errors


def check_html_file(path: Path) -> list[str]:
    checker = SiteHtmlChecker(path)
    checker.feed(path.read_text(encoding="utf-8"))
    checker.close()
    return checker.finalize()


def check_css_braces(path: Path, content: str) -> list[str]:
    errors: list[str] = []
    brace_depth = 0
    line = 1
    column = 0
    index = 0
    in_comment = False
    in_single_quote = False
    in_double_quote = False

    while index < len(content):
        char = content[index]
        column += 1

        if char == "\n":
            line += 1
            column = 0

        next_char = content[index + 1] if index + 1 < len(content) else ""

        if in_comment:
            if char == "*" and next_char == "/":
                in_comment = False
                index += 1
                column += 1
            index += 1
            continue

        if in_single_quote:
            if char == "\\":
                index += 2
                column += 1
                continue
            if char == "'":
                in_single_quote = False
            index += 1
            continue

        if in_double_quote:
            if char == "\\":
                index += 2
                column += 1
                continue
            if char == '"':
                in_double_quote = False
            index += 1
            continue

        if char == "/" and next_char == "*":
            in_comment = True
            index += 2
            column += 1
            continue

        if char == "'":
            in_single_quote = True
            index += 1
            continue

        if char == '"':
            in_double_quote = True
            index += 1
            continue

        if char == "{":
            brace_depth += 1
        elif char == "}":
            brace_depth -= 1
            if brace_depth < 0:
                errors.append(f"{path.name}:{line}:{max(column, 1)} chave de fechamento extra no CSS.")
                brace_depth = 0

        index += 1

    if in_comment:
        errors.append(f"{path.name}:{line}:{max(column, 1)} comentario CSS nao finalizado.")
    if in_single_quote or in_double_quote:
        errors.append(f"{path.name}:{line}:{max(column, 1)} string CSS nao finalizada.")
    if brace_depth != 0:
        errors.append(f"{path.name}:1:1 blocos CSS com chaves desbalanceadas.")

    return errors


def check_css_urls(path: Path, content: str) -> list[str]:
    errors: list[str] = []

    for match in re.finditer(r"url\((.*?)\)", content, flags=re.I | re.S):
        target = resolve_local_target(path, match.group(1))
        if target and not target.exists():
            line = content.count("\n", 0, match.start()) + 1
            errors.append(f"{path.name}:{line}:1 referencia CSS quebrada: {match.group(1).strip()}.")

    return errors


def check_css_file(path: Path) -> list[str]:
    content = path.read_text(encoding="utf-8")
    return [*check_css_braces(path, content), *check_css_urls(path, content)]


def check_manifest_file(path: Path) -> list[str]:
    try:
        manifest = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        return [f"{path.name}:{exc.lineno}:{exc.colno} manifest invalido: {exc.msg}."]

    errors: list[str] = []
    if not manifest.get("name"):
        errors.append(f"{path.name}:1:1 manifest sem campo name.")
    icons = manifest.get("icons")
    if not icons:
        errors.append(f"{path.name}:1:1 manifest sem icones.")
        return errors

    if not isinstance(icons, list):
        errors.append(f"{path.name}:1:1 manifest com campo icons invalido.")
        return errors

    for index, icon in enumerate(icons):
        label = f"{path.name}:icons[{index}]"
        if not isinstance(icon, dict):
            errors.append(f"{label} precisa ser um objeto.")
            continue

        src = icon.get("src")
        if not is_non_empty_string(src):
            errors.append(f"{label} campo obrigatorio ausente ou vazio: src.")
            continue

        icon_path = (path.parent / str(src)).resolve()
        if not icon_path.exists():
            errors.append(f"{label} arquivo de icone nao encontrado: {src}.")

    return errors


def main() -> None:
    errors = validate_source_data()

    try:
        build_site.validate_dist()
    except RuntimeError as exc:
        errors.append(str(exc))

    if not DIST.exists():
        errors.append("Pasta dist/ nao encontrada. Rode o build antes da validacao.")

    if errors:
        for error in errors:
            print(error)
        raise SystemExit(1)

    html_files = sorted(DIST.glob("*.html"))
    css_files = sorted(DIST.glob("*.css"))

    if not html_files:
        errors.append("Nenhum arquivo HTML foi encontrado em dist/.")

    for html_file in html_files:
        errors.extend(check_html_file(html_file))

    for css_file in css_files:
        errors.extend(check_css_file(css_file))

    manifest_path = DIST / "site.webmanifest"
    if manifest_path.exists():
        errors.extend(check_manifest_file(manifest_path))
    else:
        errors.append("site.webmanifest nao encontrado em dist/.")

    if errors:
        for error in errors:
            print(error)
        raise SystemExit(1)

    print("Site checks passed.")


if __name__ == "__main__":
    main()
