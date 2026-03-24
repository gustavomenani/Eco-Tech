from __future__ import annotations

import argparse
import json
from pathlib import Path


DEFAULT_THRESHOLDS = {
    "performance": 0.65,
    "accessibility": 0.9,
    "best-practices": 0.9,
    "seo": 0.9,
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Valida as notas do Lighthouse.")
    parser.add_argument("report", type=Path, help="Caminho para o arquivo JSON gerado pelo Lighthouse.")
    parser.add_argument("--performance", type=float, default=DEFAULT_THRESHOLDS["performance"])
    parser.add_argument("--accessibility", type=float, default=DEFAULT_THRESHOLDS["accessibility"])
    parser.add_argument("--best-practices", type=float, default=DEFAULT_THRESHOLDS["best-practices"])
    parser.add_argument("--seo", type=float, default=DEFAULT_THRESHOLDS["seo"])
    return parser.parse_args()


def load_report(path: Path) -> dict:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise SystemExit(f"Relatorio nao encontrado: {path}") from exc
    except json.JSONDecodeError as exc:
        raise SystemExit(f"Relatorio Lighthouse invalido em {path}:{exc.lineno}:{exc.colno}.") from exc


def main() -> None:
    args = parse_args()
    report = load_report(args.report)
    categories = report.get("categories", {})
    thresholds = {
        "performance": args.performance,
        "accessibility": args.accessibility,
        "best-practices": args.best_practices,
        "seo": args.seo,
    }

    failures: list[str] = []
    lines = [f"Lighthouse: {args.report}"]

    for key, minimum in thresholds.items():
        category = categories.get(key)
        score = category.get("score") if isinstance(category, dict) else None
        if score is None:
            failures.append(f"{key}: categoria ausente no relatorio.")
            continue

        percentage = round(float(score) * 100)
        lines.append(f"- {key}: {percentage} (minimo {round(minimum * 100)})")

        if float(score) < minimum:
            failures.append(f"{key}: {percentage} abaixo do minimo {round(minimum * 100)}.")

    print("\n".join(lines))

    if failures:
        raise SystemExit("Falha no Lighthouse:\n" + "\n".join(failures))


if __name__ == "__main__":
    main()
