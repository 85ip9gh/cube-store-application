#!/usr/bin/env python3
import hmac
import json
import os
import re
import subprocess
import threading
import time
import uuid
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse


BASE_DIR = Path(os.environ.get("DEPLOYER_ROOT", "/home/pesanth/cube-store-deployer"))
ARTIFACT_DIR = BASE_DIR / "artifacts"
STATUS_DIR = BASE_DIR / "status"
LOG_DIR = BASE_DIR / "logs"
DEPLOY_SCRIPT = BASE_DIR / "deploy-release.sh"
TOKEN = os.environ.get("DEPLOY_TOKEN", "")
MAX_ARTIFACT_BYTES = 20 * 1024 * 1024
SHA_PATTERN = re.compile(r"^[0-9a-f]{40}$")
ID_PATTERN = re.compile(r"^[0-9a-f]{12}-[0-9a-f]{12}$")
deployment_lock = threading.Lock()


def write_status(deployment_id, payload):
    status_path = STATUS_DIR / f"{deployment_id}.json"
    temporary_path = status_path.with_suffix(".tmp")
    payload = {**payload, "deployment_id": deployment_id, "updated_at": int(time.time())}
    temporary_path.write_text(json.dumps(payload), encoding="utf-8")
    os.replace(temporary_path, status_path)


def deploy(deployment_id, sha, artifact_path):
    log_path = LOG_DIR / f"{deployment_id}.log"
    write_status(deployment_id, {"state": "running", "sha": sha})
    try:
        with log_path.open("ab", buffering=0) as log_file:
            result = subprocess.run(
                [str(DEPLOY_SCRIPT), sha, str(artifact_path)],
                stdout=log_file,
                stderr=subprocess.STDOUT,
                check=False,
            )

        if result.returncode == 0:
            write_status(deployment_id, {
                "state": "success",
                "sha": sha,
                "url": "https://cubestore.pesanth.com",
            })
        else:
            write_status(deployment_id, {
                "state": "failed",
                "sha": sha,
                "message": "Deployment failed on g7. Check the deployer service log.",
            })
    except Exception:
        write_status(deployment_id, {
            "state": "failed",
            "sha": sha,
            "message": "The g7 deployer encountered an internal error.",
        })
    finally:
        artifact_path.unlink(missing_ok=True)
        deployment_lock.release()


class DeployHandler(BaseHTTPRequestHandler):
    server_version = "CubeStoreDeploy/1.0"

    def log_message(self, message, *args):
        print(f"{self.address_string()} {message % args}", flush=True)

    def authorized(self):
        expected = f"Bearer {TOKEN}"
        supplied = self.headers.get("Authorization", "")
        return bool(TOKEN) and hmac.compare_digest(supplied, expected)

    def send_json(self, status_code, payload):
        encoded = json.dumps(payload).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(encoded)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.end_headers()
        self.wfile.write(encoded)

    def send_not_found(self):
        self.send_json(404, {"error": "not found"})

    def do_GET(self):
        if not self.authorized():
            self.send_not_found()
            return

        path = urlparse(self.path).path
        if path == "/__deploy/health":
            self.send_json(200, {"state": "busy" if deployment_lock.locked() else "idle"})
            return

        prefix = "/__deploy/"
        if not path.startswith(prefix):
            self.send_not_found()
            return

        deployment_id = path[len(prefix):]
        if not ID_PATTERN.fullmatch(deployment_id):
            self.send_not_found()
            return

        status_path = STATUS_DIR / f"{deployment_id}.json"
        if not status_path.is_file():
            self.send_not_found()
            return

        try:
            payload = json.loads(status_path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            self.send_json(500, {"state": "failed", "message": "Deployment status is unavailable."})
            return

        self.send_json(200, payload)

    def do_POST(self):
        if urlparse(self.path).path != "/__deploy" or not self.authorized():
            self.send_not_found()
            return

        if self.headers.get("Content-Type", "").split(";", 1)[0].strip() != "application/gzip":
            self.send_json(415, {"error": "expected a gzip artifact"})
            return

        sha = self.headers.get("X-Commit-Sha", "").strip().lower()
        if not SHA_PATTERN.fullmatch(sha):
            self.send_json(400, {"error": "invalid commit SHA"})
            return

        try:
            content_length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            content_length = 0

        if content_length <= 0 or content_length > MAX_ARTIFACT_BYTES:
            self.send_json(413, {"error": "artifact size is invalid"})
            return

        if not deployment_lock.acquire(blocking=False):
            self.send_json(409, {"error": "another deployment is running"})
            return

        deployment_id = f"{sha[:12]}-{uuid.uuid4().hex[:12]}"
        artifact_path = ARTIFACT_DIR / f"{deployment_id}.tgz"
        temporary_path = artifact_path.with_suffix(".tmp")

        try:
            remaining = content_length
            with temporary_path.open("wb") as artifact_file:
                while remaining:
                    chunk = self.rfile.read(min(1024 * 1024, remaining))
                    if not chunk:
                        raise OSError("request ended before the artifact was complete")
                    artifact_file.write(chunk)
                    remaining -= len(chunk)
            os.replace(temporary_path, artifact_path)
        except Exception:
            temporary_path.unlink(missing_ok=True)
            deployment_lock.release()
            self.send_json(400, {"error": "artifact upload was incomplete"})
            return

        write_status(deployment_id, {"state": "queued", "sha": sha})
        worker = threading.Thread(
            target=deploy,
            args=(deployment_id, sha, artifact_path),
            daemon=True,
        )
        worker.start()
        self.send_json(202, {"deployment_id": deployment_id, "state": "queued"})


def main():
    if not TOKEN:
        raise SystemExit("DEPLOY_TOKEN is required")
    for directory in (ARTIFACT_DIR, STATUS_DIR, LOG_DIR):
        directory.mkdir(parents=True, exist_ok=True)
    server = ThreadingHTTPServer(("127.0.0.1", 4250), DeployHandler)
    server.serve_forever()


if __name__ == "__main__":
    main()
