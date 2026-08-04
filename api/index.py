# Vercel Python serverless entrypoint.
# Vercel discovers this file via vercel.json and calls the ASGI `app` object.
import sys
import os

# Ensure the repo root is on the path so `backend` package imports resolve.
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from backend.main import app  # noqa: F401 — Vercel needs the `app` name exported

# Vercel's Python runtime expects the ASGI application to be named `app`.
# The import above satisfies that requirement.
