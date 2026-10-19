#!/usr/bin/env python3
"""Validate local edit-plan files and timing; never certify visual quality."""
from __future__ import annotations

import argparse
import hashlib
import json
import math
from pathlib import Path
import re
import shutil
import subprocess
import sys
from typing import Any

TOLERANCE_SECONDS = 0.08
VIDEO_SUFFIXES = {".mp4", ".mov", ".mkv", ".webm", ".avi", ".m4v"}
LIMITATIONS = [
    "Technical checks do not constitute visual, aesthetic, lip-sync, or audio/video-sync approval.",
    "Focus, motion, labels, and quotes are author-entered metadata; their appearance in the rendered video is not verified.",
    "Clip metadata does not verify the playback speed or actual source ranges used in the rendered video.",
    "Hashes identify local file versions, not authenticity, factual accuracy, or usage rights.",
]


def _report() -> dict[str, Any]:
    return {"schema_version": 1, "technical_passed": False, "errors": [],
            "warnings": [], "media_durations_seconds": {}, "limitations": list(LIMITATIONS)}


def _issue(report: dict, code: str, location: str, message: str, *, warning=False) -> None:
    report["warnings" if warning else "errors"].append(
        {"code": code, "path": location, "message": message})


def _number(value: Any) -> bool:
    if not isinstance(value, (int, float)) or isinstance(value, bool):
        return False
    try:
        return math.isfinite(value)
    except OverflowError:
        return False


def _text(value: Any) -> bool:
    return isinstance(value, str) and bool(value.strip())


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _probe_duration(path: Path) -> float:
    executable = shutil.which("ffprobe")
    if not executable:
        raise RuntimeError("ffprobe is unavailable; install/configure it or explicitly use --no-probe")
    result = subprocess.run(
        [executable, "-v", "error", "-show_entries", "format=duration", "-of", "json", str(path)],
        capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=30, check=False)
    if result.returncode:
        raise RuntimeError("ffprobe could not read this media file")
    try:
        duration = float(json.loads(result.stdout)["format"]["duration"])
    except (ValueError, TypeError, KeyError) as exc:
        raise RuntimeError("ffprobe returned no usable duration") from exc
    if not math.isfinite(duration) or duration <= 0:
        raise RuntimeError("ffprobe returned an invalid duration")
    return duration


def _check_file(record: Any, location: str, base_dir: Path, report: dict) -> Path | None:
    if not isinstance(record, dict):
        _issue(report, "invalid_object", location, "Expected an object with path and sha256")
        return None
    name, expected = record.get("path"), record.get("sha256")
    if not _text(name):
        _issue(report, "invalid_path", location + ".path", "A nonempty local file path is required")
        return None
    if not isinstance(expected, str) or not re.fullmatch(r"[0-9a-fA-F]{64}", expected):
        _issue(report, "invalid_sha256", location + ".sha256", "Expected a 64-character SHA-256 digest")
        return None
    try:
        path = Path(name).expanduser()
        if not path.is_absolute():
            path = base_dir / path
        path = path.resolve()
        if not path.is_file():
            _issue(report, "missing_file", location + ".path", f"File not found: {path}")
            return None
        if _sha256(path) != expected.lower():
            _issue(report, "sha256_mismatch", location + ".sha256", "File differs from the pinned version")
            return None
        return path
    except (OSError, ValueError) as exc:
        _issue(report, "file_error", location + ".path", f"Cannot read local file: {exc}")
        return None


def check_plan(plan: Any, base_dir: Path | str, *, probe: bool = True) -> dict[str, Any]:
    """Check a parsed plan. Relative asset paths resolve against base_dir."""
    report = _report()
    base_dir = Path(base_dir)
    if not isinstance(plan, dict):
        _issue(report, "invalid_plan", "$", "The edit plan must be a JSON object")
        return report
    if type(plan.get("schema_version")) is not int or plan["schema_version"] != 1:
        _issue(report, "schema_version", "schema_version", "Only schema_version 1 is supported")
    scope = plan.get("scope")
    if scope not in ("opening", "full"):
        _issue(report, "invalid_scope", "scope", "Expected opening or full")
    duration, hook = plan.get("duration_seconds"), plan.get("hook_end_seconds")
    duration_ok = _number(duration) and duration > 0
    hook_ok = _number(hook) and hook >= 0
    if not duration_ok:
        _issue(report, "invalid_duration", "duration_seconds", "Expected positive finite seconds")
    if not hook_ok or (duration_ok and hook > duration):
        _issue(report, "invalid_hook", "hook_end_seconds", "Hook must be within the planned duration")
        hook_ok = False
    if scope == "opening" and duration_ok and hook_ok and abs(hook - duration) > TOLERANCE_SECONDS:
        _issue(report, "opening_scope", "hook_end_seconds", "An opening-only plan must end at the hook boundary")

    def record_duration(path: Path | None, key: str, location: str) -> None:
        if not probe or path is None:
            return
        try:
            report["media_durations_seconds"][key] = _probe_duration(path)
        except (RuntimeError, OSError, subprocess.TimeoutExpired) as exc:
            _issue(report, "probe_failed", location, str(exc))

    narration_path = _check_file(plan.get("narration"), "narration", base_dir, report)
    record_duration(narration_path, "narration", "narration.path")
    narration_duration = report["media_durations_seconds"].get("narration")
    if duration_ok and narration_duration is not None:
        if scope == "full" and abs(duration - narration_duration) > 0.2 + 1e-9:
            _issue(report, "narration_duration_mismatch", "duration_seconds",
                   f"Full plan duration must match narration within 0.2 seconds; audio is {narration_duration:g} seconds")
        elif scope == "opening" and duration > narration_duration + TOLERANCE_SECONDS + 1e-9:
            _issue(report, "narration_too_short", "duration_seconds",
                   f"Opening exceeds the available narration ({narration_duration:g} seconds)")
    if not probe:
        _issue(report, "probe_disabled", "$", "Media durations and source clip bounds were not probed", warning=True)
    assets = plan.get("assets")
    if not isinstance(assets, list):
        _issue(report, "invalid_assets", "assets", "Expected an array")
        assets = []
    asset_map: dict[str, dict] = {}
    video_ids: set[str] = set()
    for index, asset in enumerate(assets):
        location = f"assets[{index}]"
        path = _check_file(asset, location, base_dir, report)
        if not isinstance(asset, dict):
            continue
        asset_id = asset.get("id")
        if not _text(asset_id):
            _issue(report, "invalid_asset_id", location + ".id", "Expected a nonempty ID")
            continue
        if asset_id in asset_map:
            _issue(report, "duplicate_asset", location + ".id", "Asset IDs must be unique")
            continue
        asset_map[asset_id] = asset
        if asset.get("kind") not in ("video", "image", "ui"):
            _issue(report, "invalid_asset_kind", location + ".kind", "Expected video, image, or ui")
        if asset.get("provenance") not in ("user", "official", "third_party", "illustrative"):
            _issue(report, "invalid_provenance", location + ".provenance", "Unknown asset provenance")
        is_video = asset.get("kind") == "video" or (
            asset.get("kind") == "ui" and isinstance(asset.get("path"), str)
            and Path(asset["path"]).suffix.lower() in VIDEO_SUFFIXES)
        if is_video:
            video_ids.add(asset_id)
            record_duration(path, "asset:" + asset_id, location + ".path")

    scenes = plan.get("scenes")
    if not isinstance(scenes, list) or not scenes:
        _issue(report, "invalid_scenes", "scenes", "At least one scene is required")
        scenes = []
    intervals = []
    scene_ids: set[str] = set()
    for index, scene in enumerate(scenes):
        location = f"scenes[{index}]"
        if not isinstance(scene, dict):
            _issue(report, "invalid_scene", location, "Expected a scene object")
            continue
        scene_id = scene.get("id")
        if not _text(scene_id) or scene_id in scene_ids:
            _issue(report, "invalid_scene_id", location + ".id", "Expected a unique nonempty ID")
        else:
            scene_ids.add(scene_id)
        start, end = scene.get("start"), scene.get("end")
        interval_ok = _number(start) and _number(end) and 0 <= start < end
        if not interval_ok:
            _issue(report, "invalid_interval", location, "Scene requires 0 <= start < end")
        else:
            intervals.append((start, end, location))
            mode = scene.get("mode")
            if hook_ok and ((mode == "opening" and end > hook + TOLERANCE_SECONDS)
                            or (mode == "body" and start < hook - TOLERANCE_SECONDS)):
                _issue(report, "hook_boundary", location + ".mode", "Scene mode crosses the hook boundary")
        if scene.get("mode") not in ("opening", "body"):
            _issue(report, "invalid_mode", location + ".mode", "Expected opening or body")
        if scope == "opening" and scene.get("mode") == "body":
            _issue(report, "opening_scope", location + ".mode", "Opening-only plans cannot contain body scenes")
        for field in ("quote", "focus"):
            if not _text(scene.get(field)):
                _issue(report, "missing_description", location + "." + field, "Expected a nonempty description")
        motion = scene.get("motion")
        if not isinstance(motion, dict) or not all(_text(motion.get(field)) for field in ("family", "anchor")):
            _issue(report, "invalid_motion", location + ".motion", "Describe a motion family and its visual anchor")
        hold = scene.get("readable_hold_seconds")
        if not _number(hold) or hold < 0 or (interval_ok and hold > end - start + 1e-9):
            _issue(report, "invalid_readable_hold", location + ".readable_hold_seconds", "Hold must fit within the scene")
        role = scene.get("visual_role")
        if role not in ("material", "explanation", "emphasis"):
            _issue(report, "invalid_visual_role", location + ".visual_role", "Unknown visual role")
        ids = scene.get("asset_ids")
        if not isinstance(ids, list) or not all(_text(item) for item in ids):
            _issue(report, "invalid_scene_assets", location + ".asset_ids", "Expected an array of asset IDs")
            ids = []
        if role == "material" and not ids:
            _issue(report, "material_without_asset", location + ".asset_ids", "Material scenes need corresponding assets")
        for asset_id in ids:
            if asset_id not in asset_map:
                _issue(report, "unknown_asset", location + ".asset_ids", f"Unknown asset: {asset_id}")
            elif asset_map[asset_id].get("provenance") == "illustrative":
                label = scene.get("label", "")
                if not isinstance(label, str) or not re.search(r"演示|示意|illustrative|demo|simulation", label, re.I):
                    _issue(report, "illustrative_unlabelled", location + ".label", "Illustrative material requires an explicit demonstration/illustration label")
        clips = scene.get("clips", [])
        if not isinstance(clips, list):
            _issue(report, "invalid_clips", location + ".clips", "Expected an array")
            continue
        described_clip_ids = {clip.get("asset_id") for clip in clips
                              if isinstance(clip, dict) and isinstance(clip.get("asset_id"), str)}
        for asset_id in set(ids) & video_ids - described_clip_ids:
            _issue(report, "video_range_unspecified", location + ".clips",
                   f"Video {asset_id} is referenced without a clip; its used source range was not checked", warning=True)
        for clip_index, clip in enumerate(clips):
            clip_location = f"{location}.clips[{clip_index}]"
            if not isinstance(clip, dict):
                _issue(report, "invalid_clip", clip_location, "Expected a clip object")
                continue
            asset_id = clip.get("asset_id")
            if not isinstance(asset_id, str) or asset_id not in video_ids or asset_id not in ids:
                _issue(report, "invalid_clip_asset", clip_location + ".asset_id", "Clip must refer to a video listed in this scene")
            clip_in, clip_out, rate = clip.get("in"), clip.get("out"), clip.get("playback_rate", 1)
            if not _number(clip_in) or not _number(clip_out) or not 0 <= clip_in < clip_out:
                _issue(report, "invalid_clip_range", clip_location, "Clip requires 0 <= in < out")
            elif isinstance(asset_id, str):
                source_duration = report["media_durations_seconds"].get("asset:" + asset_id)
                if source_duration is not None and clip_out > source_duration + TOLERANCE_SECONDS:
                    _issue(report, "clip_exceeds_source", clip_location + ".out", "Clip ends beyond the probed source duration")
            if not _number(rate) or rate <= 0:
                _issue(report, "invalid_playback_rate", clip_location + ".playback_rate", "Expected a positive finite rate")
            elif abs(rate - 1) > 1e-9 and (
                not isinstance(asset_id, str) or asset_map.get(asset_id, {}).get("provenance") != "illustrative"
            ):
                _issue(report, "playback_rate_not_1x", clip_location + ".playback_rate", "Source video must play at normal speed (1x)")

    covered_until = 0.0
    for start, end, location in sorted(intervals):
        if start > covered_until + TOLERANCE_SECONDS + 1e-9:
            _issue(report, "timeline_gap", location + ".start", f"Uncovered interval: {covered_until:g} to {start:g}")
        elif start < covered_until - TOLERANCE_SECONDS - 1e-9:
            _issue(report, "timeline_overlap", location + ".start", "Scenes overlap beyond the 0.08-second tolerance")
        covered_until = max(covered_until, end)
    if duration_ok and abs(covered_until - duration) > TOLERANCE_SECONDS + 1e-9:
        _issue(report, "timeline_coverage", "duration_seconds", f"Scene coverage ends at {covered_until:g}, expected {duration:g}")
    report["technical_passed"] = not report["errors"]
    return report


def main(argv: list[str] | None = None) -> int:
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8", errors="replace")
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("plan", type=Path, help="JSON edit plan; relative paths resolve beside this file")
    parser.add_argument("--no-probe", action="store_true", help="Skip ffprobe; source durations remain unverified")
    parser.add_argument("--report", type=Path, help="Also create a JSON report; existing reports are never overwritten")
    args = parser.parse_args(argv)
    try:
        with args.plan.open("r", encoding="utf-8-sig") as handle:
            plan = json.load(handle)
        report = check_plan(plan, args.plan.resolve().parent, probe=not args.no_probe)
    except (OSError, ValueError, UnicodeError) as exc:
        report = _report()
        _issue(report, "plan_read_error", "$", f"Cannot parse/read edit plan: {exc}")
    if args.report:
        try:
            with args.report.open("x", encoding="utf-8") as handle:
                json.dump(report, handle, ensure_ascii=False, indent=2)
                handle.write("\n")
        except OSError as exc:
            _issue(report, "report_write_error", str(args.report), f"Cannot create report (no overwrite allowed): {exc}")
            report["technical_passed"] = False
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if report["technical_passed"] else 1


if __name__ == "__main__":
    sys.exit(main())
