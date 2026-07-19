"""Sri Lanka news RSS polling — Daily Mirror & Ada Derana."""

from __future__ import annotations

import json
import logging
import re
import time
import xml.etree.ElementTree as ET
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path
from typing import Any

from ..base import RunResult, Source

logger = logging.getLogger("lankawa.ingest")

OUTPUT_PATH = Path(__file__).resolve().parents[1] / "output" / "sl_news.json"

RSS_FEEDS: tuple[tuple[str, str], ...] = (
    ("daily_mirror", "https://www.dailymirror.lk/rss/breaking_news/108"),
    ("ada_derana", "https://adaderana.lk/rss.php"),
)

RSS_BLOCK_RE = re.compile(r"<rss[\s\S]*?</rss>", re.IGNORECASE)


@dataclass
class NewsHeadline:
    title: str
    url: str
    published_at: str
    source: str


class SlNews(Source):
    id = "news_rss"
    expected_cadence_minutes = 30
    file_cache_only = True

    def fetch(self) -> list[tuple[str, str]]:
        return [(source_id, self.http_get(url).text) for source_id, url in RSS_FEEDS]

    def normalise(self, raw: list[tuple[str, str]]) -> list[NewsHeadline]:
        headlines: list[NewsHeadline] = []
        seen_urls: set[str] = set()

        for source_id, body in raw:
            for item in self._parse_items(body):
                url = item["url"].strip()
                title = self._clean_text(item["title"])
                if not title or not url or url in seen_urls:
                    continue
                seen_urls.add(url)
                headlines.append(
                    NewsHeadline(
                        title=title,
                        url=url,
                        published_at=item["published_at"],
                        source=source_id,
                    )
                )

        headlines.sort(key=lambda h: h.published_at, reverse=True)
        return headlines[:30]

    def run(self, db: Any = None) -> RunResult:
        """Fetch RSS, write file cache, optionally persist headline count."""
        started = time.monotonic()
        error: str | None = None
        count = 0

        try:
            raw = self.fetch()
            headlines = self.normalise(raw)
            fetched_at = datetime.now(timezone.utc).isoformat()
            payload = {
                "sourceId": self.id,
                "fetchedAt": fetched_at,
                "headlines": [asdict(h) for h in headlines],
            }
            OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
            OUTPUT_PATH.write_text(
                json.dumps(payload, ensure_ascii=False, indent=2),
                encoding="utf-8",
            )
            count = len(headlines)

            if db is not None and headlines:
                latest = headlines[0].published_at
                db.upsert_observations(
                    [
                        {
                            "source_id": self.id,
                            "metric": "headline_count",
                            "value": float(count),
                            "unit": "headlines",
                            "observed_at": latest,
                            "meta": {"fetchedAt": fetched_at, "feeds": list(RSS_FEEDS)},
                        }
                    ]
                )
        except Exception as exc:  # noqa: BLE001
            error = f"{type(exc).__name__}: {exc}"[:1000]
            logger.exception("source %s failed", self.id)

        latency_ms = int((time.monotonic() - started) * 1000)
        ok = error is None

        if db is not None:
            try:
                failures = 0 if ok else db.last_consecutive_failures(self.id) + 1
                db.report_health(
                    source_id=self.id,
                    ok=ok,
                    latency_ms=latency_ms,
                    observations_count=count,
                    error=error,
                    consecutive_failures=failures,
                )
            except Exception:  # noqa: BLE001
                logger.exception("failed to report health for %s", self.id)

        return RunResult(self.id, ok, count, latency_ms, error)

    def _parse_items(self, body: str) -> list[dict[str, str]]:
        match = RSS_BLOCK_RE.search(body)
        xml_text = match.group(0) if match else body
        root = ET.fromstring(xml_text)
        items: list[dict[str, str]] = []

        for item in root.findall(".//item"):
            title = item.findtext("title") or ""
            link = item.findtext("link") or item.findtext("guid") or ""
            published = (
                item.findtext("pubDate")
                or item.findtext("{http://purl.org/dc/elements/1.1/}date")
                or item.findtext("updated")
                or datetime.now(timezone.utc).isoformat()
            )
            items.append(
                {
                    "title": title,
                    "url": link,
                    "published_at": self._to_iso(published),
                }
            )

        return items

    @staticmethod
    def _clean_text(value: str) -> str:
        return re.sub(r"\s+", " ", value).strip()

    @staticmethod
    def _to_iso(value: str) -> str:
        value = value.strip()
        if not value:
            return datetime.now(timezone.utc).isoformat()

        try:
            return parsedate_to_datetime(value).astimezone(timezone.utc).isoformat()
        except (TypeError, ValueError, OverflowError):
            pass

        for fmt in (
            "%Y-%m-%d %H:%M:%S",
            "%Y-%m-%dT%H:%M:%S",
            "%Y-%m-%dT%H:%M:%SZ",
        ):
            try:
                dt = datetime.strptime(value, fmt).replace(tzinfo=timezone.utc)
                return dt.isoformat()
            except ValueError:
                continue

        try:
            return datetime.fromisoformat(value.replace("Z", "+00:00")).isoformat()
        except ValueError:
            return datetime.now(timezone.utc).isoformat()
