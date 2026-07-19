"""Lankawa ingest runner."""

from __future__ import annotations

import logging
import sys

from ingest.base import RunResult
from ingest.db import Db, DbNotConfigured
from ingest.sources.cbsl_fx import CbslFx
from ingest.sources.sl_news import SlNews

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("lankawa.ingest")

SOURCES = [CbslFx(), SlNews()]


def main() -> int:
    db: Db | None = None
    try:
        db = Db.from_env()
    except DbNotConfigured as exc:
        logger.warning("%s — file-cache sources will still run", exc)

    results: list[RunResult] = []
    for source in SOURCES:
        logger.info("Running source %s", source.id)
        if db is None and not getattr(source, "file_cache_only", False):
            logger.warning("Skipping %s — database not configured", source.id)
            continue
        results.append(source.run(db))

    ok_count = sum(1 for result in results if result.ok)
    logger.info("Completed %s/%s sources", ok_count, len(results))
    if not results:
        return 1
    return 0 if ok_count == len(results) else 2


if __name__ == "__main__":
    sys.exit(main())
