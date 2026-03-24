from __future__ import annotations

import json
import os
import re
import shutil
from html import escape
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"
DIST = ROOT / "dist"
PAGES_DIR = SRC / "pages"
ASSETS_DIR = SRC / "assets"
DATA_DIR = SRC / "data"


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


CONFIG = read_json(SRC / "site.config.json")
ECOPOINTS_DOC = read_json(DATA_DIR / "ecopontos-aracatuba.json")
ECOPOINTS = ECOPOINTS_DOC.get("points", [])
MATERIALS_BY_KEY = {
    item["key"]: item["label"]
    for item in ECOPOINTS_DOC.get("materialsCatalog", [])
    if isinstance(item, dict) and "key" in item and "label" in item
}
RESOURCES_DOC = read_json(DATA_DIR / "resources.json")
RESOURCES_BY_ID = {
    item["id"]: item
    for item in RESOURCES_DOC.get("items", [])
    if isinstance(item, dict) and "id" in item
}


def normalize_site_url(value: str) -> str:
    cleaned = value.strip()
    if not cleaned:
        raise RuntimeError("SITE_URL vazio ou invalido.")
    if not re.match(r"^https?://", cleaned):
        cleaned = f"https://{cleaned}"
    return cleaned.rstrip("/")


def resolve_site_url() -> str:
    for env_key in ("SITE_URL", "VERCEL_PROJECT_PRODUCTION_URL", "VERCEL_URL"):
        env_value = os.getenv(env_key, "").strip()
        if env_value:
            return normalize_site_url(env_value)
    return normalize_site_url(CONFIG["siteUrl"])


SITE_URL = resolve_site_url()
IS_VERCEL_PREVIEW = os.getenv("VERCEL_ENV", "").strip().lower() == "preview"


def replace_once(content: str, pattern: str, replacement: str, label: str) -> str:
    updated, count = re.subn(pattern, replacement, content, count=1, flags=re.S)
    if count != 1:
        raise RuntimeError(f"Nao foi possivel substituir {label}.")
    return updated


def canonical_for(page: dict[str, str]) -> str:
    return f"{SITE_URL}/" if page["path"] == "index.html" else f"{SITE_URL}/{page['path']}"


def join_human_list(items: list[str]) -> str:
    if not items:
        return ""
    if len(items) == 1:
        return items[0]
    if len(items) == 2:
        return f"{items[0]} e {items[1]}"
    return f"{', '.join(items[:-1])} e {items[-1]}"


def build_shared_header() -> str:
    nav_links = "\n".join(
        f'        <a href="{escape(item["href"])}">{escape(item["label"])}</a>'
        for item in CONFIG["nav"]
    )

    return (
        '<header class="site-header">\n'
        '  <div class="shell">\n'
        '    <nav class="topbar" aria-label="Navegação principal">\n'
        f'      <a class="brand" href="index.html">{escape(CONFIG["siteName"])}</a>\n'
        '      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-menu" aria-label="Abrir menu principal">\n'
        '        <span class="menu-toggle-label">Menu</span>\n'
        '        <span class="menu-toggle-bars" aria-hidden="true">\n'
        '          <span></span>\n'
        '          <span></span>\n'
        '          <span></span>\n'
        '        </span>\n'
        '      </button>\n'
        '      <div class="nav-links" id="site-menu">\n'
        f'{nav_links}\n'
        '      </div>\n'
        '    </nav>\n'
        '  </div>\n'
        '</header>'
    )


def build_shared_footer() -> str:
    footer_links = "\n".join(
        f'      <a href="{escape(item["href"])}">{escape(item["label"])}</a>'
        for item in CONFIG["nav"]
    )

    footer_note = escape(CONFIG["footerNote"])

    return (
        '<footer class="site-footer">\n'
        '  <div class="shell footer-shell footer-shell-shared">\n'
        '    <div class="footer-minimal">\n'
        f'      <strong>{escape(CONFIG["siteName"])}</strong>\n'
        f'      <p>{escape(CONFIG["footerDescription"])}</p>\n'
        f'      <span class="footer-meta">{footer_note}</span>\n'
        '    </div>\n'
        '    <nav class="footer-nav" aria-label="Navegação do rodapé">\n'
        f'{footer_links}\n'
        '    </nav>\n'
        '  </div>\n'
        '</footer>'
    )


def build_json_ld(page: dict[str, str]) -> str:
    page_type = page.get("schemaType", "WebPage")
    payload: dict[str, Any] = {
        "@context": "https://schema.org",
        "@type": page_type,
        "name": page["title"],
        "description": page["description"],
        "url": canonical_for(page),
        "inLanguage": CONFIG["language"],
        "isPartOf": {
            "@type": "WebSite",
            "name": CONFIG["siteName"],
            "url": f"{SITE_URL}/",
        },
        "publisher": {
            "@type": "Organization",
            "name": CONFIG["organizationName"],
        },
    }

    if page["path"] == "aracatuba.html":
        payload["about"] = {
            "@type": "Place",
            "name": ECOPOINTS_DOC["city"],
        }

    return json.dumps(payload, ensure_ascii=False, separators=(",", ":"))


def build_metadata_block(page: dict[str, str]) -> str:
    canonical = canonical_for(page)
    social_image = f'{SITE_URL}/{CONFIG["socialImage"].lstrip("/")}'
    site_name = escape(CONFIG["siteName"], quote=True)
    title = escape(page["title"], quote=True)
    description = escape(page["description"], quote=True)
    social_image_alt = escape(CONFIG["socialImageAlt"], quote=True)
    json_ld = build_json_ld(page)
    safe_json_ld = json_ld.replace("</", "<\\/")
    robots_policy = "noindex,nofollow" if IS_VERCEL_PREVIEW else "index,follow"

    return (
        "  <!-- SYNC:SEO START -->\n"
        f"  <title>{escape(page['title'])}</title>\n"
        f'  <meta name="description" content="{description}">\n'
        f'  <meta name="author" content="{escape(CONFIG["author"], quote=True)}">\n'
        f'  <meta name="robots" content="{robots_policy}">\n'
        f'  <meta name="theme-color" content="{escape(CONFIG["themeColor"], quote=True)}">\n'
        '  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">\n'
        '  <link rel="manifest" href="site.webmanifest">\n'
        f'  <link rel="canonical" href="{escape(canonical, quote=True)}">\n'
        '  <meta property="og:locale" content="pt_BR">\n'
        '  <meta property="og:type" content="website">\n'
        f'  <meta property="og:site_name" content="{site_name}">\n'
        f'  <meta property="og:title" content="{title}">\n'
        f'  <meta property="og:description" content="{description}">\n'
        f'  <meta property="og:url" content="{escape(canonical, quote=True)}">\n'
        f'  <meta property="og:image" content="{escape(social_image, quote=True)}">\n'
        f'  <meta property="og:image:alt" content="{social_image_alt}">\n'
        f'  <meta name="twitter:card" content="{escape(CONFIG["twitterCard"], quote=True)}">\n'
        f'  <meta name="twitter:title" content="{title}">\n'
        f'  <meta name="twitter:description" content="{description}">\n'
        f'  <meta name="twitter:image" content="{escape(social_image, quote=True)}">\n'
        f'  <meta name="twitter:image:alt" content="{social_image_alt}">\n'
        f'  <script type="application/ld+json">{safe_json_ld}</script>\n'
        "  <!-- SYNC:SEO END -->"
    )


def build_ecopoint_icon(point_type: str) -> str:
    if point_type == "pev":
        return """
<svg viewBox="0 0 64 64" aria-hidden="true">
  <rect x="12" y="14" width="40" height="36" rx="6"></rect>
  <path d="M22 24h20"></path>
  <path d="M22 32h20"></path>
  <path d="M22 40h12"></path>
</svg>
""".strip()

    return """
<svg viewBox="0 0 64 64" aria-hidden="true">
  <path d="M32 56s18-12 18-28a18 18 0 1 0-36 0c0 16 18 28 18 28Z"></path>
  <circle cx="32" cy="28" r="6"></circle>
</svg>
""".strip()


def material_labels_for_keys(material_keys: list[str]) -> list[str]:
    return [MATERIALS_BY_KEY[key] for key in material_keys]


def build_material_chips(labels: list[str], list_class: str, item_class: str) -> str:
    chips = "\n".join(f'                <span class="{item_class}">{escape(label)}</span>' for label in labels)
    return (
        f'              <div class="{list_class}" aria-label="Materiais aceitos">\n'
        f"{chips}\n"
        "              </div>"
    )


def build_ecopoint_cards() -> str:
    blocks = []

    for point in ECOPOINTS:
        material_labels = material_labels_for_keys(point["materialKeys"])
        materials_text = join_human_list(material_labels)
        keywords = " ".join(
            [
                point["name"],
                point["address"],
                materials_text,
                point["hours"],
                point["type"],
            ]
        )
        material_chips = build_material_chips(material_labels, "ecopoint-materials", "ecopoint-material")

        block = f"""
            <article
              class="ecopoint-card"
              data-id="{escape(point["id"], quote=True)}"
              data-type="{escape(point["type"], quote=True)}"
              data-name="{escape(point["name"], quote=True)}"
              data-address="{escape(point["address"], quote=True)}"
              data-materials="{escape(materials_text, quote=True)}"
              data-material-keys="{escape('|'.join(point["materialKeys"]), quote=True)}"
              data-material-labels="{escape('|'.join(material_labels), quote=True)}"
              data-hours="{escape(point["hours"], quote=True)}"
              data-maps-url="{escape(point["mapsUrl"], quote=True)}"
              data-lat="{point["lat"]}"
              data-lon="{point["lon"]}"
              data-keywords="{escape(keywords, quote=True)}"
            >
              <div class="icon small">
                {build_ecopoint_icon(point["type"])}
              </div>
              <h3>{escape(point["name"])}</h3>
              <dl class="ecopoint-meta">
                <div>
                  <dt>Endereço</dt>
                  <dd><address>{escape(point["address"])}</address></dd>
                </div>
                <div>
                  <dt>Materiais aceitos</dt>
                  <dd>{escape(materials_text)}</dd>
                </div>
                <div>
                  <dt>Horário</dt>
                  <dd>{escape(point["hours"])}</dd>
                </div>
              </dl>
{material_chips}
              <a class="card-link" href="{escape(point["mapsUrl"], quote=True)}" target="_blank" rel="noopener noreferrer">Abrir localização</a>
            </article>
        """.strip("\n")
        blocks.append(block)

    return "\n\n".join(blocks)


def build_ecopoint_source_note() -> str:
    consulted_at = ECOPOINTS_DOC["consultedAtDisplay"]
    source_name = escape(ECOPOINTS_DOC["sourceName"])
    source_url = escape(ECOPOINTS_DOC["sourceUrl"], quote=True)
    city = escape(ECOPOINTS_DOC["city"])
    return (
        '<p class="source-meta source-meta-inline">'
        f'Dados de <strong>{city}</strong> consultados em {consulted_at}. '
        f'Fonte: <a class="text-link inline" href="{source_url}" target="_blank" rel="noopener noreferrer">{source_name}</a>.'
        "</p>"
    )


def get_resource(resource_id: str) -> dict[str, Any]:
    try:
        return RESOURCES_BY_ID[resource_id]
    except KeyError as exc:
        raise RuntimeError(f"Recurso desconhecido em resources.json: {resource_id}") from exc


def build_resource_card(resource_id: str, context: str) -> str:
    resource = get_resource(resource_id)
    variant = resource.get(context)

    if not isinstance(variant, dict):
        raise RuntimeError(f"Contexto '{context}' ausente para o recurso {resource_id}.")

    classes = ["resource-card"]
    if variant.get("featured"):
        classes.append("featured")
    classes.append(resource["kind"])

    badge = escape(variant["badge"])
    title = escape(variant["title"])
    kicker = escape(variant["kicker"])
    description = variant.get("description")
    button_class = "primary" if resource["kind"] == "article" else "secondary"
    media = resource["media"]

    description_markup = f'\n              <p>{escape(description)}</p>' if description else ""

    return (
        f'          <article class="{" ".join(classes)}">\n'
        "            <div class=\"resource-media\">\n"
        f'              <img src="{escape(media["src"], quote=True)}" alt="{escape(media["alt"], quote=True)}" width="{media["width"]}" height="{media["height"]}" loading="lazy" decoding="async">\n'
        f'              <span class="resource-media-label">{escape(media["label"])}</span>\n'
        "            </div>\n"
        "            <div class=\"resource-card-body\">\n"
        f"              <span class=\"resource-badge\">{badge}</span>\n"
        f"              <h3>{title}</h3>\n"
        f"              <p class=\"resource-kicker\">{kicker}</p>"
        f"{description_markup}\n"
        "              <div class=\"resource-actions\">\n"
        f'                <a class="button {button_class}" href="{escape(resource["url"], quote=True)}" target="_blank" rel="noopener noreferrer">{escape(resource["cta"])}</a>\n'
        "              </div>\n"
        "            </div>\n"
        "          </article>"
    )


def build_resource_grid(resource_ids: list[str], context: str, extra_class: str = "") -> str:
    class_names = "resource-grid"
    if extra_class:
        class_names += f" {extra_class}"

    cards = "\n\n".join(build_resource_card(resource_id, context) for resource_id in resource_ids)
    return f'<div class="{class_names}">\n{cards}\n        </div>'


def build_home_resource_spotlight() -> str:
    spotlight_resources = [get_resource(resource_id) for resource_id in RESOURCES_DOC["homeSpotlightIds"]]
    thumb_markup = "\n".join(
        (
            f'            <img class="resource-spotlight-thumb thumb-{index + 1}" '
            f'src="{escape(resource["media"]["src"], quote=True)}" '
            f'alt="{escape(resource["media"]["alt"], quote=True)}" '
            f'width="{resource["media"]["width"]}" '
            f'height="{resource["media"]["height"]}" '
            'loading="lazy" decoding="async">'
        )
        for index, resource in enumerate(spotlight_resources[:2])
    )
    link_markup = "\n".join(
        (
            f'          <a class="resource-spotlight-link" href="{escape(resource["url"], quote=True)}" target="_blank" rel="noopener noreferrer">\n'
            f'            <span class="resource-spotlight-index">{index + 1:02d}</span>\n'
            f'            <strong>{escape(resource["home"]["title"])}</strong>\n'
            f'            <span>{escape(resource["home"]["kicker"])}</span>\n'
            "          </a>"
        )
        for index, resource in enumerate(spotlight_resources)
    )

    return (
        '<div class="resource-spotlight">\n'
        '          <div class="resource-spotlight-copy">\n'
        '            <p class="pill">Leitura principal</p>\n'
        '            <h3 class="feature-heading">Comece pelos dois artigos que dão peso acadêmico ao projeto.</h3>\n'
        '            <p>Eles concentram os principais argumentos sobre impacto ambiental, logística reversa, triagem, reuso e responsabilidade compartilhada.</p>\n'
        "          </div>\n"
        '          <div class="resource-spotlight-visual">\n'
        f"{thumb_markup}\n"
        "          </div>\n"
        '          <div class="resource-spotlight-links">\n'
        f"{link_markup}\n"
        "          </div>\n"
        "        </div>"
    )


def build_source_panels() -> str:
    blocks = []

    for panel in RESOURCES_DOC["sourcePanels"]:
        block = (
            "          <article class=\"source-panel\">\n"
            f"            <h3>{escape(panel['title'])}</h3>\n"
            f"            <p>{escape(panel['description'])}</p>\n"
            f'            <a class="text-link" href="{escape(panel["url"], quote=True)}" target="_blank" rel="noopener noreferrer">{escape(panel["cta"])}</a>\n'
            "          </article>"
        )
        blocks.append(block)

    return '<div class="source-links">\n' + "\n\n".join(blocks) + "\n        </div>"


def build_sources_summary() -> str:
    resources_consulted_at = RESOURCES_DOC["consultedAtDisplay"]
    ecopoints_consulted_at = ECOPOINTS_DOC["consultedAtDisplay"]
    return (
        '<p class="source-meta">'
        "Fontes organizadas a partir de dados da Prefeitura de Araçatuba, do Global E-waste Monitor 2024, "
        "dos artigos acadêmicos citados acima e dos vídeos de apoio. "
        f"Materiais acadêmicos e audiovisuais consultados em {resources_consulted_at}; "
        f"dados locais de ecopontos consultados em {ecopoints_consulted_at}."
        "</p>"
    )


def build_manifest() -> dict[str, Any]:
    return {
        "name": CONFIG["siteName"],
        "short_name": CONFIG["siteName"],
        "description": CONFIG["manifestDescription"],
        "lang": CONFIG["language"],
        "start_url": "./index.html",
        "scope": "./",
        "display": "standalone",
        "background_color": CONFIG["backgroundColor"],
        "theme_color": CONFIG["themeColor"],
        "icons": [
            {
                "src": "assets/favicon.svg",
                "sizes": "any",
                "type": "image/svg+xml",
                "purpose": "any",
            },
            {
                "src": "assets/icon-192.png",
                "sizes": "192x192",
                "type": "image/png",
                "purpose": "any maskable",
            },
            {
                "src": "assets/icon-512.png",
                "sizes": "512x512",
                "type": "image/png",
                "purpose": "any maskable",
            }
        ],
    }


def sync_pages() -> None:
    header_html = build_shared_header()
    footer_html = build_shared_footer()
    cards_html = build_ecopoint_cards()
    source_note_html = build_ecopoint_source_note()
    home_spotlight_html = build_home_resource_spotlight()
    home_resources_html = build_resource_grid(RESOURCES_DOC["homeResourceIds"], "home")
    sources_featured_html = build_resource_grid(RESOURCES_DOC["sourcesFeaturedIds"], "sources", "resource-grid-featured")
    sources_videos_html = build_resource_grid(RESOURCES_DOC["sourcesVideoIds"], "sources")
    source_panels_html = build_source_panels()
    sources_summary_html = build_sources_summary()

    for page in CONFIG["pages"]:
        source_path = PAGES_DIR / page["path"]
        content = source_path.read_text(encoding="utf-8")

        content = re.sub(
            r"<html lang=\"[^\"]+\">",
            f'<html lang="{escape(CONFIG["language"], quote=True)}">',
            content,
            count=1,
        )
        content = replace_once(content, r"  <!-- SYNC:SEO START -->.*?  <!-- SYNC:SEO END -->", build_metadata_block(page), "seo")
        content = replace_once(content, r"<header class=\"site-header\">.*?</header>", header_html, "header")
        content = replace_once(content, r"<footer class=\"site-footer\">.*?</footer>", footer_html, "footer")

        if page["path"] == "index.html":
            content = replace_once(
                content,
                r"<!-- HOME_RESOURCE_SPOTLIGHT_START -->.*?<!-- HOME_RESOURCE_SPOTLIGHT_END -->",
                f"<!-- HOME_RESOURCE_SPOTLIGHT_START -->\n        {home_spotlight_html}\n        <!-- HOME_RESOURCE_SPOTLIGHT_END -->",
                "faixa principal dos materiais da home",
            )
            content = replace_once(
                content,
                r"<!-- FEATURED_RESOURCES_HOME_START -->.*?<!-- FEATURED_RESOURCES_HOME_END -->",
                f"<!-- FEATURED_RESOURCES_HOME_START -->\n        {home_resources_html}\n        <!-- FEATURED_RESOURCES_HOME_END -->",
                "materiais em destaque da home",
            )

        if page["path"] == "aracatuba.html":
            cards_replacement = f"<!-- ECOPOINTS_CARDS_START -->\n{cards_html}\n          <!-- ECOPOINTS_CARDS_END -->"
            content = replace_once(
                content,
                r"<!-- ECOPOINTS_CARDS_START -->.*?<!-- ECOPOINTS_CARDS_END -->",
                cards_replacement,
                "cartoes dos ecopontos",
            )
            content = replace_once(
                content,
                r"<!-- ECOPOINTS_SOURCE_NOTE -->.*?<!-- ECOPOINTS_SOURCE_NOTE END -->",
                f"<!-- ECOPOINTS_SOURCE_NOTE -->\n            {source_note_html}\n            <!-- ECOPOINTS_SOURCE_NOTE END -->",
                "fonte dos ecopontos",
            )
            content = re.sub(r"\s*<!-- ECOPOINTS_DATA_START -->.*?<!-- ECOPOINTS_DATA_END -->\s*", "\n", content, flags=re.S)

        if page["path"] == "contato-ou-fontes.html":
            content = replace_once(
                content,
                r"<!-- FEATURED_RESOURCES_SOURCES_START -->.*?<!-- FEATURED_RESOURCES_SOURCES_END -->",
                f"<!-- FEATURED_RESOURCES_SOURCES_START -->\n        {sources_featured_html}\n        <!-- FEATURED_RESOURCES_SOURCES_END -->",
                "artigos em destaque da pagina de fontes",
            )
            content = replace_once(
                content,
                r"<!-- SOURCE_PANELS_START -->.*?<!-- SOURCE_PANELS_END -->",
                f"<!-- SOURCE_PANELS_START -->\n        {source_panels_html}\n        <!-- SOURCE_PANELS_END -->",
                "painel de fontes complementares",
            )
            content = replace_once(
                content,
                r"<!-- VIDEO_RESOURCES_START -->.*?<!-- VIDEO_RESOURCES_END -->",
                f"<!-- VIDEO_RESOURCES_START -->\n        {sources_videos_html}\n        <!-- VIDEO_RESOURCES_END -->",
                "videos em destaque da pagina de fontes",
            )
            content = replace_once(
                content,
                r"<!-- SOURCES_SUMMARY_START -->.*?<!-- SOURCES_SUMMARY_END -->",
                f"<!-- SOURCES_SUMMARY_START -->\n        {sources_summary_html}\n        <!-- SOURCES_SUMMARY_END -->",
                "resumo das fontes consultadas",
            )

        (DIST / page["path"]).write_text(content.rstrip() + "\n", encoding="utf-8")


def copy_static_files() -> None:
    shutil.copytree(ASSETS_DIR, DIST / "assets")
    shutil.copy2(SRC / "styles.css", DIST / "styles.css")
    shutil.copy2(SRC / "site.js", DIST / "site.js")


def build_manifest_file() -> None:
    manifest = json.dumps(build_manifest(), ensure_ascii=False, indent=2)
    (DIST / "site.webmanifest").write_text(manifest + "\n", encoding="utf-8")


def build_sitemap() -> None:
    entries = []

    for page in CONFIG["pages"]:
        loc = canonical_for(page)
        entries.append(
            "  <url>\n"
            f"    <loc>{loc}</loc>\n"
            "  </url>"
        )

    sitemap = (
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
        "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n"
        f"{chr(10).join(entries)}\n"
        "</urlset>\n"
    )
    (DIST / "sitemap.xml").write_text(sitemap, encoding="utf-8")


def build_robots() -> None:
    if IS_VERCEL_PREVIEW:
        robots = (
            "User-agent: *\n"
            "Disallow: /\n"
        )
    else:
        robots = (
            "User-agent: *\n"
            "Allow: /\n\n"
            f"Sitemap: {SITE_URL}/sitemap.xml\n"
        )
    (DIST / "robots.txt").write_text(robots, encoding="utf-8")


def build_nojekyll() -> None:
    (DIST / ".nojekyll").write_text("", encoding="utf-8")


def validate_dist() -> None:
    html_files = list(DIST.glob("*.html"))
    missing_refs: list[str] = []

    for html_file in html_files:
        content = html_file.read_text(encoding="utf-8")
        for attribute in ("href", "src"):
            pattern = rf'{attribute}="([^"]+)"'
            for match in re.finditer(pattern, content):
                target = match.group(1)
                if re.match(r"^(https?:|mailto:|tel:|#|javascript:)", target):
                    continue

                target_path = html_file.parent / target.split("#", 1)[0]
                if not target_path.exists():
                    missing_refs.append(f"{html_file.name}: {attribute}={target}")

    if missing_refs:
        raise RuntimeError("Referencias quebradas encontradas:\n" + "\n".join(missing_refs))


def clean_dist() -> None:
    DIST.mkdir(parents=True, exist_ok=True)

    for child in DIST.iterdir():
        if child.is_dir():
            shutil.rmtree(child)
        else:
            child.unlink()


def main() -> None:
    clean_dist()
    copy_static_files()
    build_manifest_file()
    sync_pages()
    build_sitemap()
    build_robots()
    build_nojekyll()
    validate_dist()


if __name__ == "__main__":
    main()
