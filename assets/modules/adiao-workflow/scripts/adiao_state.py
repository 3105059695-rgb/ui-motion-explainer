#!/usr/bin/env python3
"""Local handoff ledger for one 阿刁 episode; Python standard library only.

This tool neither calls production services nor approves work from text. The
caller must invoke ``confirm`` ONLY after the user has actually approved the
exact current voice/opening file. --user-message records that message verbatim;
its words are not interpreted as authorization by this program.
"""

from __future__ import annotations

import argparse
from contextlib import contextmanager
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import sys
import uuid


KINDS = ("script", "voice", "avatar", "opening", "final", "copy")
GATES = ("voice", "opening")
DIRECTORIES = ("input",) + KINDS
DEPENDENCIES = {
    "script": (), "voice": ("script",), "avatar": ("voice",),
    "opening": ("voice", "avatar"), "final": ("voice", "avatar", "opening"),
    "copy": (),
}
DESCENDANTS = {
    "script": ("voice", "avatar", "opening", "final"),
    "voice": ("avatar", "opening", "final"),
    "avatar": ("opening", "final"), "opening": ("final",),
    "final": (), "copy": (),
}


class StateError(Exception):
    """Invalid operation or conflicting state; CLI exits with code 2."""


def now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="microseconds").replace("+00:00", "Z")


def absolute(value: str | Path) -> Path:
    return Path(value).expanduser().resolve()


def fingerprint(value: str | Path) -> dict:
    path = absolute(value)
    if not path.is_file():
        raise StateError(f"Asset is not an existing regular file: {path}")
    before = path.stat()
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for block in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(block)
    after = path.stat()
    if (before.st_size, before.st_mtime_ns) != (after.st_size, after.st_mtime_ns):
        raise StateError(f"Asset changed while hashing; retry after writing finishes: {path}")
    return {"path": str(path), "sha256": digest.hexdigest(), "size_bytes": after.st_size}


def event(state: dict, action: str, **details) -> None:
    timestamp = now()
    state["updated_at"] = timestamp
    state["events"].append({"at": timestamp, "action": action, **details})


def save(root: Path, state: dict) -> None:
    temporary = root / f".project-{uuid.uuid4().hex}.tmp"
    try:
        with temporary.open("x", encoding="utf-8", newline="\n") as handle:
            json.dump(state, handle, ensure_ascii=False, indent=2)
            handle.write("\n")
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temporary, root / "project.json")
    finally:
        if temporary.exists():
            temporary.unlink()


@contextmanager
def project_lock(root: Path):
    """Fail on concurrent writers, without trying to delete anyone else's lock."""
    lock = root / ".adiao-state.lock"
    try:
        fd = os.open(str(lock), os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    except FileExistsError as exc:
        raise StateError(f"Project is locked by another operation: {lock}") from exc
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as handle:
            json.dump({"pid": os.getpid(), "created_at": now()}, handle)
        yield
    finally:
        lock.unlink(missing_ok=True)


def initialize(root: Path, title: str) -> dict:
    if not title.strip():
        raise StateError("Title cannot be blank.")
    if (root / "project.json").exists():
        raise StateError(f"Project already exists; init will not overwrite it: {root}")
    if root.exists() and not root.is_dir():
        raise StateError(f"Project path is not a directory: {root}")
    for name in DIRECTORIES:
        path = root / name
        if path.exists() and not path.is_dir():
            raise StateError(f"Expected a directory, found a file: {path}")
    root.mkdir(parents=True, exist_ok=True)
    with project_lock(root):
        if (root / "project.json").exists():
            raise StateError(f"Project already exists: {root}")
        for name in DIRECTORIES:
            (root / name).mkdir(exist_ok=True)
        timestamp = now()
        state = {
            "schema_version": 1, "project_id": uuid.uuid4().hex,
            "project_path": str(root), "title": title,
            "created_at": timestamp, "updated_at": timestamp,
            "directories": {name: str(root / name) for name in DIRECTORIES},
            "assets": {}, "asset_history": [], "approvals": {}, "events": [],
        }
        event(state, "initialized", title=title)
        # Exclusive creation keeps init non-destructive, even in a race.
        with (root / "project.json").open("x", encoding="utf-8", newline="\n") as handle:
            json.dump(state, handle, ensure_ascii=False, indent=2)
            handle.write("\n")
        return state


def load(root: Path) -> dict:
    try:
        with (root / "project.json").open(encoding="utf-8") as handle:
            state = json.load(handle)
    except (OSError, ValueError) as exc:
        raise StateError(f"Cannot read project.json: {exc}") from exc
    if not isinstance(state, dict) or state.get("schema_version") != 1:
        raise StateError("Unsupported or invalid project.json schema.")
    required = {"assets": dict, "approvals": dict, "events": list, "asset_history": list}
    for key, expected_type in required.items():
        if not isinstance(state.get(key), expected_type):
            raise StateError(f"Invalid project.json field: {key}")
    for kind, asset in state["assets"].items():
        if kind not in KINDS or not isinstance(asset, dict):
            raise StateError(f"Invalid asset entry: {kind}")
        if not all(key in asset for key in ("path", "sha256", "revision", "valid", "dependencies")):
            raise StateError(f"Incomplete asset entry: {kind}")
    return state


def invalidate(state: dict, kind: str, reason: str, include_self: bool = True) -> bool:
    targets = ((kind,) if include_self else ()) + DESCENDANTS[kind]
    changed = False
    for target in targets:
        asset = state["assets"].get(target)
        if asset and asset["valid"]:
            asset.update(valid=False, invalidated_at=now(), invalid_reason=reason)
            event(state, "asset_invalidated", kind=target, revision=asset["revision"], reason=reason)
            changed = True
        approval = state["approvals"].get(target)
        if approval and approval.get("valid"):
            approval.update(valid=False, invalidated_at=now(), invalid_reason=reason)
            event(state, "approval_invalidated", gate=target, sha256=approval["sha256"], reason=reason)
            changed = True
    return changed


def same_asset(left: dict, right: dict) -> bool:
    return all(left.get(key) == right.get(key) for key in ("path", "sha256", "revision"))


def reconcile(state: dict) -> bool:
    """Persistently invalidate changed/missing files and their downstream work."""
    changed = False
    for kind in KINDS:
        asset = state["assets"].get(kind)
        if not asset or not asset["valid"]:
            continue
        try:
            current = fingerprint(asset["path"])
            problem = None if current["sha256"] == asset["sha256"] else "content changed on disk"
        except (StateError, OSError) as exc:
            problem = str(exc)
        if problem:
            changed |= invalidate(state, kind, f"{kind}: {problem}; attach the file again to register its current version")
            continue
        for dependency, snapshot in asset["dependencies"].items():
            upstream = state["assets"].get(dependency)
            if not upstream or not upstream["valid"] or not same_asset(upstream, snapshot):
                changed |= invalidate(state, kind, f"{kind}: registered {dependency} dependency is no longer current")
                break
    for gate in GATES:
        approval = state["approvals"].get(gate)
        asset = state["assets"].get(gate)
        if approval and approval.get("valid") and (not asset or not asset["valid"] or not same_asset(asset, approval)):
            changed |= invalidate(state, gate, f"{gate}: approval does not match the current asset")
    return changed


def require_asset(state: dict, kind: str) -> dict:
    asset = state["assets"].get(kind)
    if not asset or not asset["valid"]:
        raise StateError(f"Current valid {kind} asset is required.")
    return asset


def require_approval(state: dict, gate: str) -> dict:
    asset = require_asset(state, gate)
    approval = state["approvals"].get(gate)
    if not approval or not approval.get("valid") or not same_asset(asset, approval):
        raise StateError(f"User confirmation of the current {gate} file is required.")
    return approval


def check_attach(state: dict, kind: str) -> None:
    if kind == "voice" and "script" in state["assets"]:
        require_asset(state, "script")
    if kind in ("avatar", "opening", "final"):
        require_approval(state, "voice")
    if kind in ("opening", "final"):
        require_asset(state, "avatar")
    if kind == "final":
        require_approval(state, "opening")


def attach(state: dict, root: Path, kind: str, file: str) -> dict:
    check_attach(state, kind)
    content = fingerprint(file)
    if absolute(content["path"]) in (root / "project.json", root / ".adiao-state.lock"):
        raise StateError("Project control files cannot be attached as production assets.")
    previous = state["assets"].get(kind)
    if previous and previous["valid"] and all(previous[key] == content[key] for key in ("path", "sha256")):
        return previous  # Idempotent; do not discard approval for identical input.
    if previous:
        invalidate(state, kind, f"{kind}: a replacement version was attached")
        state["asset_history"].append({"kind": kind, **previous})
    dependencies = {
        dependency: {key: state["assets"][dependency][key] for key in ("path", "sha256", "revision")}
        for dependency in DEPENDENCIES[kind] if dependency in state["assets"]
    }
    asset = {**content, "revision": uuid.uuid4().hex, "attached_at": now(), "valid": True, "dependencies": dependencies}
    state["assets"][kind] = asset
    event(state, "asset_attached", kind=kind, asset=asset.copy())
    return asset


def confirm(state: dict, gate: str, user_message: str) -> dict:
    if not user_message.strip():
        raise StateError("Record the actual non-empty user confirmation message.")
    if gate == "opening":
        check_attach(state, "opening")
    asset = require_asset(state, gate)
    approval = {
        **{key: asset[key] for key in ("path", "sha256", "revision")},
        "confirmed_at": now(), "user_message": user_message, "valid": True,
        "source": "explicit_confirm_command_after_user_approval",
    }
    state["approvals"][gate] = approval
    event(state, "user_confirmation_recorded", gate=gate, approval=approval.copy())
    return approval


def snapshot(state: dict) -> dict:
    can_attach, blocked_by = {}, {}
    for kind in KINDS:
        try:
            check_attach(state, kind)
            can_attach[kind] = True
        except StateError as exc:
            can_attach[kind] = False
            blocked_by[kind] = str(exc)
    next_step = "final_ready"
    for kind in ("voice", "avatar", "opening", "final"):
        if not state["assets"].get(kind, {}).get("valid"):
            next_step = f"prepare_{kind}"
            break
        if kind in GATES:
            try:
                require_approval(state, kind)
            except StateError:
                next_step = f"await_{kind}_confirmation"
                break
    invalid_assets = [kind for kind, asset in state["assets"].items() if not asset["valid"]]
    return {
        "schema_version": 1, "project_id": state["project_id"], "title": state["title"],
        "project_path": state["project_path"], "updated_at": state["updated_at"],
        "assets": state["assets"], "approvals": state["approvals"],
        "next_step": next_step, "can_attach": can_attach, "blocked_by": blocked_by,
        "valid": not invalid_assets, "invalid_assets": invalid_assets,
        "confirmation_rule": "Only call confirm after actual user approval of the exact current file; message text is never interpreted automatically.",
    }


def parser() -> argparse.ArgumentParser:
    result = argparse.ArgumentParser(description=__doc__)
    commands = result.add_subparsers(dest="command", required=True)
    for name in ("init", "status", "attach", "confirm", "handoff"):
        command = commands.add_parser(name)
        command.add_argument("--project", required=True, help="Episode directory containing project.json")
        if name == "init":
            command.add_argument("--title", required=True)
        elif name == "attach":
            command.add_argument("--kind", choices=KINDS, required=True)
            command.add_argument("--file", required=True)
        elif name == "confirm":
            command.add_argument("--gate", choices=GATES, required=True)
            command.add_argument("--user-message", required=True, help="Actual user approval text; retained verbatim, not interpreted")
        elif name == "handoff":
            command.add_argument("--output", help="Optional new JSON file; existing files are never overwritten")
    return result


def main(argv: list[str] | None = None) -> int:
    args = parser().parse_args(argv)
    try:
        root = absolute(args.project)
        if args.command == "init":
            result = snapshot(initialize(root, args.title))
            code = 0
        else:
            if not (root / "project.json").is_file():
                raise StateError(f"No initialized project at: {root}")
            with project_lock(root):
                state = load(root)
                changed = reconcile(state)
                try:
                    if args.command == "attach":
                        attach(state, root, args.kind, args.file)
                        changed = True
                    elif args.command == "confirm":
                        confirm(state, args.gate, args.user_message)
                        changed = True
                    result = snapshot(state)
                    if args.command == "handoff" and args.output:
                        output = absolute(args.output)
                        if output.exists():
                            raise StateError(f"Handoff output already exists; refusing to overwrite: {output}")
                        with output.open("x", encoding="utf-8", newline="\n") as handle:
                            json.dump(result, handle, ensure_ascii=False, indent=2)
                            handle.write("\n")
                finally:
                    if changed:
                        save(root, state)
                code = 2 if args.command in ("status", "handoff") and not result["valid"] else 0
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return code
    except (StateError, OSError, ValueError, KeyError, TypeError) as exc:
        print(json.dumps({"error": str(exc)}, ensure_ascii=False), file=sys.stderr)
        return 2


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    raise SystemExit(main())
