#!/usr/bin/env python3
"""Create a portable Remotion project without overwriting existing work."""

from __future__ import annotations

import argparse
import json
import math
import shutil
import sys
from pathlib import Path


EXCLUDED_NAMES = {
    "node_modules", "out", "dist", "build", ".git", "private",
    "source-media", ".cache", ".remotion", "__pycache__",
    "local-reference-props.json",
}
IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif"}


def ignored_files(directory: str, names: list[str]) -> set[str]:
    return {
        name for name in names
        if name.lower() in EXCLUDED_NAMES
        or name.lower() == ".env"
        or name.lower().startswith(".env.")
        or name.lower().endswith((".log", ".pyc"))
        or (Path(directory) / name).is_symlink()
    }


def create_project(
    out: Path, screenshot: Path | None, title: str, focus: list[float] | None = None
) -> Path:
    skill_root = Path(__file__).resolve().parent.parent
    template = skill_root / "assets" / "remotion-template"
    destination = out.expanduser().resolve()
    if not (template / "package.json").is_file():
        raise ValueError(f"Remotion template is missing: {template}")
    if destination == template or template in destination.parents:
        raise ValueError("Output must be outside the Remotion template directory.")
    if destination.exists():
        if not destination.is_dir():
            raise ValueError(f"Output is not a directory: {destination}")
        if any(destination.iterdir()):
            raise ValueError(f"Output directory is not empty; nothing was overwritten: {destination}")

    source_image = None
    if screenshot is not None:
        source_image = screenshot.expanduser().resolve()
        if not source_image.is_file():
            raise ValueError(f"Screenshot file does not exist: {source_image}")
        if source_image.suffix.lower() not in IMAGE_EXTENSIONS:
            raise ValueError("Screenshot must use PNG, JPEG, WebP, GIF or AVIF format.")
        if source_image.stat().st_size == 0:
            raise ValueError("Screenshot file is empty.")

    if focus is None:
        focus = [0.20, 0.25, 0.60, 0.45] if source_image is not None else [0.66, 0.55, 0.29, 0.24]
    if len(focus) != 4 or not all(math.isfinite(value) for value in focus):
        raise ValueError("Focus requires four finite numbers: X Y WIDTH HEIGHT.")
    x, y, width, height = focus
    if not (0 <= x <= 1 and 0 <= y <= 1 and 0 < width <= 1 and 0 < height <= 1):
        raise ValueError("Focus X/Y must be within 0..1 and WIDTH/HEIGHT within (0..1].")
    if x + width > 1 or y + height > 1:
        raise ValueError("Focus must fit inside the panel: X + WIDTH <= 1 and Y + HEIGHT <= 1.")

    shutil.copytree(template, destination, dirs_exist_ok=True, ignore=ignored_files)
    public_dir = destination / "public"
    public_dir.mkdir(parents=True, exist_ok=True)
    screenshot_relative = None
    if source_image is not None:
        relative_image = Path("user-input") / f"input{source_image.suffix.lower()}"
        image_target = public_dir / relative_image
        image_target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source_image, image_target)
        screenshot_relative = relative_image.as_posix()

    content = {
        "version": 1,
        "title": title,
        "screenshot": screenshot_relative,
        "screenshotFit": "contain",
        "focus": {"x": x, "y": y, "width": width, "height": height},
        "sourceKind": "user-screenshot" if source_image is not None else "demo",
        "note": "用户提供的截图；外部动效不代表软件实际执行。"
        if source_image is not None else "可替换的演示内容。",
    }
    (public_dir / "user-content.json").write_text(
        json.dumps(content, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    return destination


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", required=True, type=Path, help="New or empty project directory")
    parser.add_argument("--screenshot", type=Path, help="Local screenshot to preserve and animate")
    parser.add_argument("--title", default="把想法变成结果", help="Screenshot stage title")
    parser.add_argument(
        "--focus", nargs=4, type=float, metavar=("X", "Y", "WIDTH", "HEIGHT"),
        help="Chosen focus rectangle in normalized 456x425 panel coordinates; not image recognition",
    )
    args = parser.parse_args()
    try:
        destination = create_project(args.out, args.screenshot, args.title, args.focus)
    except (ValueError, OSError) as exc:
        parser.error(str(exc))
    print(f"Created project: {destination}")
    print("Run npm ci, then npm run dev in this directory.")
    print("Render: npx remotion render src/index.ts ScreenshotStage out/screenshot-stage.mp4")
    return 0


if __name__ == "__main__":
    sys.exit(main())
