#!/usr/bin/env python3
"""Export a checked, offline Qiaomu font pairing. Python standard library only.

This does not install system fonts, download files, or overwrite a destination.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import shutil
import sys
import tempfile


BUNDLE = Path(__file__).resolve().parents[1] / "assets" / "qiaomu-fonts"


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def font_css(fonts: list[dict]) -> str:
    lines = ["/* Original font binaries. Local CSS aliases only; no global styles. */"]
    for font in fonts:
        fmt = "truetype" if font["file"].endswith(".ttf") else "woff2"
        lines.append(
            "@font-face {\n"
            f"  font-family: '{font['family']}';\n"
            f"  src: url('./fonts/{font['file']}') format('{fmt}');\n"
            f"  font-weight: {font['weight']};\n"
            f"  font-style: {font['style']};\n"
            "  font-display: block;\n}"
        )
    return "\n\n".join(lines) + "\n"


def pairing_css(pairings: list[dict], registry: dict[str, dict]) -> str:
    lines = ["/* Opt-in roles only. Load fonts.css first; await font loads before rendering. */"]
    for pairing in pairings:
        lines.append(f".qm-pairing[data-pairing=\"{pairing['id']}\"] {{")
        for role in ("title", "body", "latin"):
            font = registry[pairing[role]]
            fallback = []
            if role == "latin" and pairing["body"] != font["id"]:
                fallback.append(registry[pairing["body"]]["family"])
            if font["id"] != "notosans" and "Qiaomu-notosans" not in fallback:
                fallback.append("Qiaomu-notosans")
            families = ", ".join(f"'{family}'" for family in [font["family"], *fallback])
            lines.append(f"  --qm-{role}-font: {families}, sans-serif;")
            lines.append(f"  --qm-{role}-weight: {font['weight']};")
            lines.append(f"  --qm-{role}-style: {font['style']};")
        lines.append("}")
    for role in ("title", "body", "latin"):
        lines.append(
            f".qm-pairing .qm-{role} {{\n"
            f"  font-family: var(--qm-{role}-font);\n"
            f"  font-weight: var(--qm-{role}-weight);\n"
            f"  font-style: var(--qm-{role}-style);\n"
            "  font-synthesis: none;\n}"
        )
    return "\n".join(lines) + "\n"


def validate(bundle: Path, indexed: list[dict], registry: dict[str, dict], source: dict):
    licenses = {item["id"]: item for item in source["verification"]["licenses"]}
    for font in indexed:
        ident = font["id"]
        # Never accept path components in file names from metadata.
        if Path(font["file"]).name != font["file"] or any(c in ident for c in "/\\"):
            raise ValueError(f"Unsafe font entry: {ident}")
        path = bundle / "fonts" / font["file"]
        if path.stat().st_size != font["bytes"] or sha256(path) != font["sha256"]:
            raise ValueError(f"Font checksum mismatch: {ident}")
        metadata = registry[ident]
        if metadata["file"] != font["file"] or metadata["family"] != f"Qiaomu-{ident}":
            raise ValueError(f"Registry mismatch: {ident}")
        license_path = bundle / "licenses" / f"{ident}.txt"
        if sha256(license_path) != licenses[ident]["sha256"]:
            raise ValueError(f"License checksum mismatch: {ident}")


def export(pairing_id: str | None, out: Path, export_all: bool = False) -> dict:
    index = load_json(BUNDLE / "index.json")
    all_pairings = load_json(BUNDLE / "pairings.json")["pairings"]
    registry_list = load_json(BUNDLE / "registry.json")["fonts"]
    registry = {font["id"]: font for font in registry_list}
    source = load_json(BUNDLE / "source.json")
    if export_all:
        pairings = all_pairings
        selected_ids = set(registry)
    else:
        pairings = [pairing for pairing in all_pairings if pairing["id"] == pairing_id]
        if not pairings:
            raise ValueError(f"Unknown pairing: {pairing_id}. Use --list to see valid IDs.")
        pairing = pairings[0]
        selected_ids = {pairing[role] for role in ("title", "body", "latin")}
        selected_ids.update(pairing["latinAlternates"])
        selected_ids.add("notosans")  # Bundled CJK fallback for less-complete display fonts.
    indexed = [font for font in index["fonts"] if font["id"] in selected_ids]
    selected_registry = [font for font in registry_list if font["id"] in selected_ids]
    if len(indexed) != len(selected_ids):
        raise ValueError("Pairing references a missing font.")
    validate(BUNDLE, indexed, registry, source)
    effects_sha256 = sha256(BUNDLE / "effects.css")
    out = out.expanduser().resolve()
    if out.exists():
        raise ValueError(f"Destination already exists; choose a new directory: {out}")
    out.parent.mkdir(parents=True, exist_ok=True)
    staging = Path(tempfile.mkdtemp(prefix=f".{out.name}.staging-", dir=out.parent))
    try:
        (staging / "fonts").mkdir()
        (staging / "licenses").mkdir()
        for font in indexed:
            shutil.copyfile(BUNDLE / "fonts" / font["file"], staging / "fonts" / font["file"])
            shutil.copyfile(BUNDLE / "licenses" / f"{font['id']}.txt", staging / "licenses" / f"{font['id']}.txt")
        for filename in ("README.upstream.md", "source.json", "effects.css"):
            shutil.copyfile(BUNDLE / filename, staging / filename)
        write_json(staging / "index.json", {**index, "fonts": indexed})
        write_json(staging / "registry.json", {"version": 1, "fonts": selected_registry})
        write_json(staging / "pairings.json", {"version": 1, "pairings": pairings})
        (staging / "fonts.css").write_text(font_css(selected_registry), encoding="utf-8")
        (staging / "pairings.css").write_text(pairing_css(pairings, registry), encoding="utf-8")
        validate(staging, indexed, registry, source)
        if sha256(staging / "effects.css") != effects_sha256:
            raise ValueError("Local effects.css checksum mismatch.")
        report = {
            "pairings": [pairing["id"] for pairing in pairings],
            "fontCount": len(indexed),
            "fontIds": [font["id"] for font in indexed],
            "fontBytes": sum(font["bytes"] for font in indexed),
            "fontAndLicenseChecksumsPassed": True,
            "upstreamCommit": source["commit"],
            "originalFontBinariesUnmodified": True,
            "systemFontInstallation": False,
            "networkRequired": False,
            "effectsIncluded": True,
            "effectsSha256": effects_sha256,
            "effectsSource": "ui-motion-fusion local integration (not upstream font repository)",
        }
        write_json(staging / "export-manifest.json", report)
        (staging / "README.md").write_text(
            "# Offline Qiaomu fonts\n\n"
            "Load `fonts.css`, then `pairings.css`. Add `class=\"qm-pairing\"` "
            "and `data-pairing=\"" + pairings[0]["id"] + "\"` to a wrapper. "
            "Use `qm-title`, `qm-body`, and `qm-latin` on its descendants.\n\n"
            "For optional local title effects, add `<link rel=\"stylesheet\" href=\"effects.css\">` "
            "after the two font stylesheets. Combine `qm-fx` with `qm-fx-highlight`, "
            "`qm-fx-sticker`, `qm-fx-depth`, `qm-fx-outline`, or `qm-fx-plain`; for example "
            "`<span class=\"qm-title qm-fx qm-fx-highlight\">重点</span>`. "
            "These effects are local additions by ui-motion-fusion, not part of the upstream font library.\n\n"
            "Use the exact weight/style in `registry.json`; do not synthesize bold or italic. "
            "Wait for `document.fonts.load(...)` for each used face, then `document.fonts.ready`, "
            "before measuring or rendering video frames. `font-display:block` alone is not a loading guarantee.\n\n"
            "All font files and corresponding OFL notices are preserved verbatim. "
            "Keep `licenses/` and `source.json` when redistributing this project. "
            "No network requests or system font installation are required.\n",
            encoding="utf-8",
        )
        staging.rename(out)
        return {**report, "out": str(out)}
    finally:
        if staging.exists():
            # Remove only the uniquely created staging directory for this invocation.
            if staging.resolve().parent != out.parent or not staging.name.startswith(f".{out.name}.staging-"):
                raise ValueError("Refusing cleanup outside the export staging directory.")
            shutil.rmtree(staging)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--list", action="store_true", help="List the 12 bundled pairings")
    mode.add_argument("--pairing", metavar="ID", help="Export one pairing, alternates and CJK fallback")
    mode.add_argument("--all", action="store_true", help="Export all 34 font files and pairings")
    parser.add_argument("--out", type=Path, help="New output directory (must not already exist)")
    args = parser.parse_args()
    try:
        if args.list:
            print(json.dumps(load_json(BUNDLE / "pairings.json"), ensure_ascii=False, indent=2))
        else:
            if args.out is None:
                parser.error("--out is required for export")
            print(json.dumps(export(args.pairing, args.out, args.all), ensure_ascii=False, indent=2))
        return 0
    except (OSError, ValueError, KeyError) as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    raise SystemExit(main())
