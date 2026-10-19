#!/usr/bin/env python3
"""Small, explicit-cost MiniMax H3 client for metaso.cn (Python standard library).

No command automatically polls, retries paid POSTs, uploads to public hosting, or
prints credentials/API response bodies. `plan` is offline. See --help.
Protocol sources (checked 2026-10-13):
https://github.com/meta-sota/ComfyUI-MiniMaxH3-API/blob/main/api_client.py
https://platform.minimax.io/docs/api-reference/video-generation-v2-create
https://platform.minimax.io/docs/api-reference/video-generation-v2-query
Prices are Metaso's displayed CNY equivalents, not a server-enforced spending cap.
"""
import argparse
import base64
import ctypes
import hashlib
import json
import os
from pathlib import Path
import re
import socket
import sys
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, build_opener, HTTPRedirectHandler

API_BASE = "https://metaso.cn/api/minimax"
MODEL = "MiniMax-H3"
PRICE_DATE = "2026-10-13"
PRICES = {"480P": "0.06", "768P": "0.09", "1080P": "0.14", "2K": "0.15"}
RATIOS = ("adaptive", "21:9", "16:9", "4:3", "1:1", "3:4", "9:16")
SUCCESS = {"success", "succeeded", "completed", "done"}
FAILED = {"failed", "fail", "cancelled", "canceled", "expired", "error"}
PENDING = {"queued", "pending", "preparing", "processing", "running"}
PLAN_SCHEMA = "ui-motion-fusion/metaso-plan-v1"
QUERY_SCHEMA = "ui-motion-fusion/metaso-query-v1"
MAX_IMAGE_BYTES = 30 * 1024 * 1024
MAX_REQUEST_BYTES = 60 * 1024 * 1024
MAX_DOWNLOAD_BYTES = 2 * 1024 * 1024 * 1024
TASK_RE = re.compile(r"[A-Za-z0-9_-]{1,128}\Z")


class ClientError(Exception):
    """Safe, deliberately bounded user-facing failure."""


class APIError(ClientError):
    def __init__(self, code):
        self.code = code
        super().__init__("API request failed (HTTP %s); response body suppressed." % code)


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


class HTTPSOnlyRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        validate_https(newurl)
        redirected = super().redirect_request(req, fp, code, msg, headers, newurl)
        if redirected:
            redirected.remove_header("Authorization")
            redirected.remove_header("Cookie")
        return redirected


def now():
    return datetime.now(timezone.utc).isoformat()


def key_path():
    folder = os.environ.get("LOCALAPPDATA")
    return Path(folder) / "ui-motion-fusion" / "metaso-api-key.dpapi" if folder else None


def validate_key(value):
    if not isinstance(value, str) or not value or len(value) > 4096 or any(c.isspace() or ord(c) < 32 for c in value):
        raise ClientError("API key is missing or invalid; configure it locally.")
    return value


def load_key():
    """Environment first; otherwise current-user Windows DPAPI. Never log it."""
    env = os.environ.get("METASO_API_KEY")
    if env:
        return validate_key(env.strip())
    path = key_path()
    if os.name != "nt" or path is None or not path.is_file():
        raise ClientError("No local Metaso API key. Run the local credential setup first.")
    try:
        raw = path.read_bytes()
        if not raw or len(raw) > 65536:
            raise ValueError()
        class Blob(ctypes.Structure):
            _fields_ = [("cbData", ctypes.c_uint32), ("pbData", ctypes.POINTER(ctypes.c_ubyte))]
        buf = (ctypes.c_ubyte * len(raw)).from_buffer_copy(raw)
        incoming = Blob(len(raw), buf)
        outgoing = Blob()
        crypt = ctypes.WinDLL("crypt32", use_last_error=True)
        kernel = ctypes.WinDLL("kernel32", use_last_error=True)
        crypt.CryptUnprotectData.argtypes = [ctypes.POINTER(Blob), ctypes.c_void_p, ctypes.c_void_p, ctypes.c_void_p, ctypes.c_void_p, ctypes.c_uint32, ctypes.POINTER(Blob)]
        crypt.CryptUnprotectData.restype = ctypes.c_int
        kernel.LocalFree.argtypes = [ctypes.c_void_p]
        kernel.LocalFree.restype = ctypes.c_void_p
        if not crypt.CryptUnprotectData(ctypes.byref(incoming), None, None, None, None, 1, ctypes.byref(outgoing)):
            raise ValueError()
        try:
            value = ctypes.string_at(outgoing.pbData, outgoing.cbData).decode("utf-8")
        finally:
            kernel.LocalFree(outgoing.pbData)
        return validate_key(value)
    except Exception:
        raise ClientError("The encrypted key could not be read by this Windows user; configure it again.") from None


def status():
    configured = False
    try:
        load_key()
        configured = True
    except ClientError:
        pass
    return {"provider": "metaso.cn", "configured": configured, "network_checked": False,
            "source": ("environment" if os.environ.get("METASO_API_KEY") else "windows_dpapi") if configured else None}


def validate_https(url):
    if not isinstance(url, str) or any(c.isspace() or ord(c) < 32 for c in url):
        raise ClientError("Expected an HTTPS URL.")
    parsed = urlparse(url)
    if parsed.scheme != "https" or not parsed.hostname or parsed.username or parsed.password or parsed.fragment:
        raise ClientError("Only HTTPS URLs without embedded credentials/fragments are supported.")
    return url


def task_id(value):
    if not isinstance(value, str) or not TASK_RE.fullmatch(value):
        raise ClientError("Invalid task ID.")
    return value


def api_json(method, endpoint, payload=None, key=None):
    """One request, no retries or redirects, bounded response, sanitized errors."""
    if method not in ("GET", "POST") or not endpoint.startswith("/v2/") or "?" in endpoint:
        raise ClientError("Unsupported API route.")
    data = None if payload is None else json.dumps(payload, ensure_ascii=False).encode("utf-8")
    if data is not None and len(data) > MAX_REQUEST_BYTES:
        raise ClientError("Request exceeds the local 60 MiB safety limit.")
    headers = {"Authorization": "Bearer " + validate_key(key or load_key()), "Accept": "application/json"}
    if data is not None:
        headers["Content-Type"] = "application/json"
    req = Request(API_BASE + endpoint, data=data, headers=headers, method=method)
    try:
        with build_opener(NoRedirect()).open(req, timeout=120) as response:
            raw = response.read(4 * 1024 * 1024 + 1)
            if len(raw) > 4 * 1024 * 1024:
                raise ClientError("API response exceeded the local size limit.")
        result = json.loads(raw)
        if not isinstance(result, dict):
            raise ClientError("API response had an unexpected shape.")
        base = result.get("base_resp")
        if result.get("error") or (isinstance(base, dict) and base.get("status_code", 0) != 0):
            raise ClientError("The API returned an application error; sensitive response details suppressed.")
        return result
    except HTTPError as exc:
        raise APIError(exc.code) from None
    except (URLError, TimeoutError, socket.timeout, OSError):
        raise ClientError("Network outcome is uncertain; no automatic retry was made.") from None
    except (json.JSONDecodeError, UnicodeDecodeError):
        raise ClientError("API returned invalid JSON; no automatic retry was made.") from None


def check(identifier=None):
    # Metaso's maintainer documents query, not list. Without a known task we
    # report local status and make no speculative authentication requests.
    if identifier is None:
        return status()
    identifier = task_id(identifier)
    try:
        result = api_json("GET", "/v2/query/video_generation/" + identifier)
        task = result.get("task")
        verified = isinstance(task, dict) and str(task.get("id", "")) == identifier
        return {"reachable": True, "authenticated": True if verified else None,
                "method": "read_only_task_query", "generation_submitted": False,
                "note": "Authentication verified for supplied task." if verified else "Endpoint responded; authentication remains unverified without a known task."}
    except APIError as exc:
        return {"reachable": True, "authenticated": False if exc.code in (401, 403) else None,
                "http_status": exc.code, "generation_submitted": False,
                "note": "An unknown-task response does not prove authentication."}


def read_json(path):
    try:
        if Path(path).stat().st_size > 4 * 1024 * 1024:
            raise ClientError("Local JSON file is too large.")
        return json.loads(Path(path).read_text(encoding="utf-8-sig"))
    except (OSError, UnicodeDecodeError, json.JSONDecodeError):
        raise ClientError("Could not read the local JSON file.") from None


def save_json(path, value, replace=False):
    path = Path(path)
    if not path.parent.is_dir():
        raise ClientError("Output parent directory does not exist.")
    if not replace:
        try:
            with path.open("x", encoding="utf-8", newline="\n") as f:
                json.dump(value, f, ensure_ascii=False, indent=2)
                f.write("\n")
            return
        except FileExistsError:
            raise ClientError("Output already exists; choose a new output path.") from None
    # Only receipts owned by a newly-created run directory use replacement.
    temporary = path.with_name(path.name + ".tmp")
    with temporary.open("x", encoding="utf-8", newline="\n") as f:
        json.dump(value, f, ensure_ascii=False, indent=2)
        f.write("\n")
    os.replace(temporary, path)


def image_metadata(path):
    try:
        path = Path(path).resolve(strict=True)
        if not path.is_file() or not 0 < path.stat().st_size <= MAX_IMAGE_BYTES:
            raise ClientError("Local image must be a nonempty file no larger than 30 MiB.")
        data = path.read_bytes()
    except OSError:
        raise ClientError("Could not read a local image.") from None
    mime = None
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        mime = "image/png"
    elif data.startswith(b"\xff\xd8\xff"):
        mime = "image/jpeg"
    elif data.startswith(b"RIFF") and data[8:12] == b"WEBP":
        mime = "image/webp"
    if not mime:
        raise ClientError("Local images must be PNG, JPEG, or WebP.")
    return {"path": str(path), "sha256": hashlib.sha256(data).hexdigest(), "bytes": len(data), "mime": mime}


def estimate(request):
    return {"currency": "CNY", "estimated_total": str((Decimal(PRICES[request["resolution"]]) * request["duration"]).quantize(Decimal("0.01"))),
            "per_output_second": PRICES[request["resolution"]], "price_checked_on": PRICE_DATE,
            "source": "https://metaso.cn/minimax-h3", "channel": "standard",
            "is_server_quote": False, "actual_charge": "Metaso charges credits; displayed CNY equivalents are rounded. This is not a provider-enforced spending limit."}


def validate_request(request, local_images):
    allowed = {"model", "content", "resolution", "duration", "ratio", "context_ir_enabled", "fast_mode", "aigc_watermark"}
    if not isinstance(request, dict) or set(request) - allowed or request.get("model") != MODEL:
        raise ClientError("Request must use the supported MiniMax-H3 fields only.")
    if request.get("context_ir_enabled") is not False:
        raise ClientError("Context IR must explicitly remain disabled in this client.")
    if request.get("fast_mode") is not False:
        raise ClientError("The ordinary channel must explicitly remain selected (fast_mode=false).")
    if "aigc_watermark" in request and type(request["aigc_watermark"]) is not bool:
        raise ClientError("aigc_watermark must be a Boolean.")
    duration = request.get("duration")
    if type(duration) is not int or not 4 <= duration <= 15:
        raise ClientError("This client supports integer durations from 4 to 15 seconds.")
    if request.get("resolution") not in PRICES or request.get("ratio") not in RATIOS:
        raise ClientError("Unsupported resolution or ratio.")
    content = request.get("content")
    if not isinstance(content, list) or not 1 <= len(content) <= 6:
        raise ClientError("Provide one prompt and at most five images.")
    texts, roles, slots = [], [], []
    for item in content:
        if not isinstance(item, dict):
            raise ClientError("Invalid content item.")
        if item.get("type") == "text" and set(item) == {"type", "text"}:
            if not isinstance(item["text"], str) or not 1 <= len(item["text"].strip()) <= 10000:
                raise ClientError("Prompt length must be 1–10000 characters.")
            texts.append(item)
        elif item.get("type") == "image_url" and set(item) == {"type", "image_url", "role"}:
            role, image = item["role"], item["image_url"]
            if role not in ("first_frame", "last_frame", "reference_image") or not isinstance(image, dict) or set(image) != {"url"}:
                raise ClientError("Invalid image role or source.")
            url = image["url"]
            if isinstance(url, str) and re.fullmatch(r"local-file:[0-4]", url):
                slots.append(int(url.split(":")[1]))
            else:
                validate_https(url)
            roles.append(role)
        else:
            raise ClientError("Only text and image references are supported; no audio/video references.")
    if len(texts) != 1 or len(roles) > 5 or roles.count("first_frame") > 1 or roles.count("last_frame") > 1:
        raise ClientError("Invalid prompt or image count.")
    if "reference_image" in roles and any(r in roles for r in ("first_frame", "last_frame")):
        raise ClientError("First/last frames and reference images cannot be mixed.")
    if not roles and request["ratio"] == "adaptive":
        raise ClientError("Text-only generation requires a concrete aspect ratio.")
    if any(r in roles for r in ("first_frame", "last_frame")) and request["ratio"] != "adaptive":
        raise ClientError("First/last-frame mode requires adaptive ratio (derived from images).")
    if not isinstance(local_images, list) or sorted(slots) != list(range(len(local_images))):
        raise ClientError("Local image manifest does not match the request.")


def make_plan(prompt_file, duration=5, resolution="768P", ratio=None, first_frame=None, last_frame=None, references=None):
    try:
        prompt = Path(prompt_file).read_text(encoding="utf-8-sig").strip()
    except (OSError, UnicodeDecodeError):
        raise ClientError("Could not read the UTF-8 prompt file.") from None
    content = [{"type": "text", "text": prompt}]
    images = []
    sources = [("first_frame", first_frame), ("last_frame", last_frame)] + [("reference_image", item) for item in (references or [])]
    for role, source in sources:
        if source is None:
            continue
        if source.startswith("https://"):
            url = validate_https(source)
        else:
            url = "local-file:" + str(len(images))
            images.append(image_metadata(source))
        content.append({"type": "image_url", "image_url": {"url": url}, "role": role})
    request = {"model": MODEL, "content": content, "resolution": resolution, "duration": duration,
               "ratio": ratio or ("adaptive" if first_frame or last_frame else "16:9"), "context_ir_enabled": False, "fast_mode": False}
    validate_request(request, images)
    if sum(i["bytes"] for i in images) * 4 / 3 > MAX_REQUEST_BYTES - 100000:
        raise ClientError("Combined local images exceed the local request size limit.")
    return {"schema": PLAN_SCHEMA, "created_at": now(), "request": request, "local_images": images,
            "estimate": estimate(request), "disclosure": "On explicitly approved create, the prompt and image references/data are sent to metaso.cn, a third-party provider. Planning sends nothing.",
            "limits": "One video; 4–15 seconds; up to 5 images; no audio/video input; standard channel; Context IR disabled; no automatic paid retries.",
            "image_dimensions": "PNG/JPEG/WebP magic and sizes checked locally; dimensions must satisfy provider limits (256–5760px, ratio 0.4–2.5). Not automatically validated."}


def materialize(plan):
    request = json.loads(json.dumps(plan["request"]))
    for item in request["content"]:
        if item["type"] != "image_url" or not item["image_url"]["url"].startswith("local-file:"):
            continue
        index = int(item["image_url"]["url"].split(":")[1])
        expected = plan["local_images"][index]
        actual = image_metadata(expected.get("path", ""))
        if actual != expected:
            raise ClientError("A local image changed after planning; make a fresh plan before approval.")
        data = Path(actual["path"]).read_bytes()
        if hashlib.sha256(data).hexdigest() != actual["sha256"]:
            raise ClientError("A local image changed while reading; submission stopped.")
        item["image_url"]["url"] = "data:" + actual["mime"] + ";base64," + base64.b64encode(data).decode("ascii")
    if len(json.dumps(request, ensure_ascii=False).encode("utf-8")) > MAX_REQUEST_BYTES:
        raise ClientError("Materialized request exceeds the local size limit.")
    return request


def create(request_file, out_dir, approve_cost=False, max_cost_cny=None):
    # Approval and cap checks occur before key loading, network or directory creation.
    if not approve_cost or max_cost_cny is None:
        raise ClientError("Paid submission requires --approve-cost and --max-cost-cny after explicit user approval.")
    try:
        cap = Decimal(str(max_cost_cny))
    except InvalidOperation:
        raise ClientError("Cost limit must be a finite positive number.") from None
    if not cap.is_finite() or cap <= 0:
        raise ClientError("Cost limit must be a finite positive number.")
    plan = read_json(request_file)
    if not isinstance(plan, dict) or plan.get("schema") != PLAN_SCHEMA:
        raise ClientError("Use a request plan created by the plan command.")
    validate_request(plan.get("request"), plan.get("local_images"))
    cost = estimate(plan["request"])
    if plan.get("estimate") != cost:
        raise ClientError("Price information changed or plan was edited; regenerate the plan before approval.")
    if Decimal(cost["estimated_total"]) > cap:
        raise ClientError("Estimated cost exceeds --max-cost-cny; nothing was submitted.")
    payload = materialize(plan)
    key = load_key()
    output = Path(out_dir)
    try:
        output.mkdir(parents=False, exist_ok=False)
    except OSError:
        raise ClientError("Choose a new output directory within an existing parent; an existing run is never resubmitted.") from None
    payload_hash = hashlib.sha256(json.dumps(payload, sort_keys=True, ensure_ascii=False).encode("utf-8")).hexdigest()
    receipt = {"schema": "ui-motion-fusion/metaso-create-v1", "created_at": now(), "state": "submission_started",
               "provider": "metaso.cn", "model": MODEL, "request_sha256": payload_hash,
               "estimate": cost, "approved_local_estimate_cap_cny": str(cap), "automatic_retries": 0,
               "recovery": "Never repeat a paid create merely because it timed out. Check the provider task list/UI, then query the known task ID."}
    receipt_path = output / "receipt.json"
    save_json(receipt_path, receipt)
    try:
        result = api_json("POST", "/v2/video_generation", payload, key=key)
        identifier = task_id(result.get("task_id"))
        receipt.update(state="submitted", task_id=identifier, updated_at=now())
        save_json(receipt_path, receipt, replace=True)
        return {"state": "submitted", "task_id": identifier, "receipt": str(receipt_path), "automatic_retries": 0}
    except Exception as exc:
        rejected = isinstance(exc, APIError) and exc.code in (400, 401, 402, 403, 404, 422, 429)
        receipt.update(state="rejected" if rejected else "submission_uncertain", updated_at=now())
        if isinstance(exc, APIError):
            receipt["http_status"] = exc.code
        save_json(receipt_path, receipt, replace=True)
        raise ClientError("Submission %s. Receipt saved; do not automatically resubmit. Check the provider UI first." % receipt["state"]) from None


def query(identifier, out):
    identifier = task_id(identifier)
    if Path(out).exists():
        raise ClientError("Query output already exists; choose a new filename.")
    result = api_json("GET", "/v2/query/video_generation/" + identifier)
    task = result.get("task")
    if not isinstance(task, dict) or str(task.get("id", "")) != identifier:
        raise ClientError("Query did not return the requested task.")
    raw_status = str(task.get("status", "")).lower()
    state = raw_status if raw_status in SUCCESS | FAILED | PENDING else "unknown"
    saved = {"schema": QUERY_SCHEMA, "queried_at": now(), "provider": "metaso.cn", "task_id": identifier, "status": state}
    if state in SUCCESS:
        content = task.get("content")
        url = content.get("url") if isinstance(content, dict) else None
        if url:
            saved["result_url"] = validate_https(url)
    save_json(out, saved)
    return {"task_id": identifier, "status": state, "result_available": "result_url" in saved, "saved": str(out)}


def download(query_file, out):
    saved = read_json(query_file)
    if not isinstance(saved, dict) or saved.get("schema") != QUERY_SCHEMA or saved.get("provider") != "metaso.cn" or saved.get("status") not in SUCCESS:
        raise ClientError("Only a successful saved query can be downloaded.")
    task_id(saved.get("task_id"))
    url = validate_https(saved.get("result_url"))
    destination = Path(out)
    temporary = destination.with_name(destination.name + ".part")
    if destination.exists() or temporary.exists() or not destination.parent.is_dir():
        raise ClientError("Output/partial file exists or parent is missing; choose a new output path.")
    total, digest, prefix = 0, hashlib.sha256(), b""
    owned_partial = False
    try:
        # No credential loading and no Authorization header to the result CDN.
        request = Request(url, headers={"Accept": "video/mp4,application/octet-stream"}, method="GET")
        with build_opener(HTTPSOnlyRedirect()).open(request, timeout=120) as response:
            if response.getcode() != 200:
                raise ClientError("Download did not return HTTP 200.")
            length = response.headers.get("Content-Length")
            expected = int(length) if length is not None else None
            if expected is not None and not 0 < expected <= MAX_DOWNLOAD_BYTES:
                raise ClientError("Invalid or excessive video download size.")
            with temporary.open("xb") as target:
                owned_partial = True
                while True:
                    chunk = response.read(1024 * 1024)
                    if not chunk:
                        break
                    total += len(chunk)
                    if total > MAX_DOWNLOAD_BYTES:
                        raise ClientError("Video exceeds the local 2 GiB download limit.")
                    prefix = (prefix + chunk)[:16]
                    digest.update(chunk)
                    target.write(chunk)
                target.flush()
                os.fsync(target.fileno())
            if not total or (expected is not None and total != expected) or prefix[4:8] != b"ftyp":
                raise ClientError("Downloaded file is empty, incomplete, or lacks an MP4 signature.")
        # Hard-link creation is atomic and refuses to replace an existing target.
        os.link(temporary, destination)
        try:
            temporary.unlink()
            owned_partial = False
        except OSError:
            pass  # Final output is complete; leftover .part must not invite another download.
        return {"task_id": saved["task_id"], "path": str(destination), "bytes": total,
                "sha256": digest.hexdigest(), "mp4_signature_checked": True, "playback_checked": False}
    except Exception:
        if owned_partial:
            try:
                temporary.unlink()
            except OSError:
                pass
        raise ClientError("Download failed; no existing output was replaced. No API credential was sent to the CDN.") from None


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("status", help="Local credential state only; no network and no key output")
    checking = sub.add_parser("check", help="Read-only query with known ID; without an ID returns local status only")
    checking.add_argument("--task-id")
    planning = sub.add_parser("plan", help="Offline plan, references and price estimate; no key required")
    planning.add_argument("--prompt-file", required=True)
    planning.add_argument("--out", required=True)
    planning.add_argument("--duration", type=int, default=5)
    planning.add_argument("--resolution", type=str.upper, choices=tuple(PRICES), default="768P")
    planning.add_argument("--ratio", choices=RATIOS)
    planning.add_argument("--first-frame")
    planning.add_argument("--last-frame")
    planning.add_argument("--reference-image", action="append", default=[])
    creating = sub.add_parser("create", help="One paid submission; requires explicit approved cost flags")
    creating.add_argument("--request", required=True)
    creating.add_argument("--out-dir", required=True)
    creating.add_argument("--approve-cost", action="store_true")
    creating.add_argument("--max-cost-cny")
    querying = sub.add_parser("query", help="One read-only task query, no polling")
    querying.add_argument("task_id")
    querying.add_argument("--out", required=True)
    downloading = sub.add_parser("download", help="Download only a successful query result; no CDN auth")
    downloading.add_argument("--query-result", required=True)
    downloading.add_argument("--out", required=True)
    args = parser.parse_args(argv)
    try:
        if args.command == "status":
            result = status()
        elif args.command == "check":
            result = check(args.task_id)
        elif args.command == "plan":
            plan = make_plan(args.prompt_file, args.duration, args.resolution, args.ratio, args.first_frame, args.last_frame, args.reference_image)
            save_json(args.out, plan)
            result = {"plan": str(args.out), "estimate": plan["estimate"], "network_used": False, "reference_count": len(plan["request"]["content"]) - 1}
        elif args.command == "create":
            result = create(args.request, args.out_dir, args.approve_cost, args.max_cost_cny)
        elif args.command == "query":
            result = query(args.task_id, args.out)
        else:
            result = download(args.query_result, args.out)
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return 0
    except ClientError as exc:
        print(json.dumps({"error": str(exc)}, ensure_ascii=False), file=sys.stderr)
        return 2
    except Exception:
        print(json.dumps({"error": "Local operation failed; sensitive details suppressed."}), file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
