#!/usr/bin/env python3
"""Import sourced influencer coverage from Google News RSS; never invent stories."""
import datetime as dt
import email.utils
import html
import json
import os
import re
import sys
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from urllib.parse import urlparse

INFLUENCERS = [
    ("Baka Prase", ["Baka Prase", "Bogdan Ilic", "Bogdan Ilić", "Бака Прасе", "Богдан Илић"]),
    ("Barbi Afrika", ["Barbi Afrika", "Barbara Milenkovic", "Barbara Milenković"]),
    ("Choda", ["Choda"]),
    ("Mudja", ["Mudja", "Muđa", "Муђа"]),
    ("Marko Jack", ["Marko Jack"]),
    ("Mihajlo Madić", ["Mihajlo Madic", "Mihajlo Madić"]),
    ("Vanjorek obitelj", ["Vanjorek obitelj", "Vanjorek"]),
    ("Goldenito", ["Goldenito"]),
    ("Marko Filipović", ["Marko Filipovic", "Marko Filipović"]),
]

TRUSTED_DOMAINS = {
    "index.hr", "jutarnji.hr", "vecernji.hr", "dnevnik.hr", "24sata.hr",
    "net.hr", "b92.net", "n1info.rs", "n1info.hr", "rts.rs", "klix.ba",
    "avaz.ba", "blic.rs", "nova.rs", "telegraf.rs", "mondo.rs", "vijesti.me", "dnevnik.rs",
}
FEEDS = (("hr", "HR", "HR:hr"), ("sr", "RS", "RS:sr"))
MAX_AGE = dt.timedelta(days=7)
USER_AGENT = "VijestiZaNezaposleneBot/1.0 (+RSS reader)"


def plain_text(value):
    value = re.sub(r"<[^>]*>", " ", value or "")
    return re.sub(r"\s+", " ", html.unescape(value)).strip()


def normalized(value):
    value = value.casefold().translate(str.maketrans({"а":"a","б":"b","в":"v","г":"g","д":"d","ђ":"dj","е":"e","ж":"z","з":"z","и":"i","ј":"j","к":"k","л":"l","љ":"lj","м":"m","н":"n","њ":"nj","о":"o","п":"p","р":"r","с":"s","т":"t","ћ":"c","у":"u","ф":"f","х":"h","ц":"c","ч":"c","џ":"dz","ш":"s"})).replace("đ", "dj")
    value = re.sub(r"[^a-z0-9]+", " ", value)
    return " ".join(value.split())


def allowed_source(source_url):
    host = (urlparse(source_url).hostname or "").lower()
    return any(host == domain or host.endswith("." + domain) for domain in TRUSTED_DOMAINS)


def parse_date(value):
    try:
        parsed = email.utils.parsedate_to_datetime(value)
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=dt.timezone.utc)
        return parsed.astimezone(dt.timezone.utc)
    except (TypeError, ValueError, OverflowError):
        return None


def fetch_feed(name, language, country, edition):
    query = urllib.parse.urlencode({
        "q": '"' + name + '" when:7d',
        "hl": language,
        "gl": country,
        "ceid": edition,
    })
    url = "https://news.google.com/rss/search?" + query
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=20) as response:
        return ET.fromstring(response.read())


def collect():
    cutoff = dt.datetime.now(dt.timezone.utc) - MAX_AGE
    unique = {}
    seen_headlines = set()
    for display_name, aliases in INFLUENCERS:
        alias_keys = [normalized(alias) for alias in aliases]
        for language, country, edition in FEEDS:
            try:
                root = fetch_feed(display_name, language, country, edition)
            except Exception as error:
                print("Feed unavailable for " + display_name + ": " + type(error).__name__, file=sys.stderr)
                continue
            for item in root.findall("./channel/item"):
                title = plain_text(item.findtext("title"))
                description = plain_text(item.findtext("description"))
                link = (item.findtext("link") or "").strip()
                source_node = item.find("source")
                source_name = plain_text(source_node.text if source_node is not None else "")
                source_url = source_node.attrib.get("url", "") if source_node is not None else ""
                published = parse_date(item.findtext("pubDate"))
                searchable = normalized(title + " " + description)

                if not title or not link or not published or published < cutoff:
                    continue
                if not source_name or not allowed_source(source_url):
                    continue
                suffix = " - " + source_name
                if title.casefold().endswith(suffix.casefold()):
                    title = title[:-len(suffix)].strip()
                if not any(alias in searchable for alias in alias_keys):
                    continue
                headline_key = (display_name, normalized(title))
                if link in unique or headline_key in seen_headlines:
                    continue
                seen_headlines.add(headline_key)

                unique[link] = {
                    "influencer": display_name,
                    "title": title[:240],
                    "body": (
                        "Cijeli članak pročitaj na " + source_name + "."
                        if normalized(description).startswith(normalized(title))
                        else (description or "Otvori izvor za cijeli članak.")[:500]
                    ),
                    "category": "Vijesti iz medija",
                    "source_name": source_name[:120],
                    "source_url": link,
                    "published_at": published.isoformat(),
                    "is_automated": True,
                    "published": True,
                }

    return sorted(unique.values(), key=lambda story: story["published_at"], reverse=True)


def save_to_supabase(stories):
    base_url = os.environ.get("SUPABASE_URL", "").rstrip("/")
    secret = os.environ.get("SUPABASE_SECRET_KEY", "")
    if not base_url or not secret:
        raise RuntimeError("Set SUPABASE_URL and SUPABASE_SECRET_KEY in GitHub Actions secrets.")
    if not stories:
        print("No new matching stories found.")
        return 0

    endpoint = base_url + "/rest/v1/news?on_conflict=source_url"
    payload = json.dumps(stories, ensure_ascii=False).encode("utf-8")
    request = urllib.request.Request(endpoint, data=payload, method="POST", headers={
        "apikey": secret,
        "Content-Type": "application/json",
        "Prefer": "resolution=ignore-duplicates,return=minimal",
    })
    with urllib.request.urlopen(request, timeout=30) as response:
        if response.status not in (200, 201, 204):
            raise RuntimeError("Supabase returned HTTP " + str(response.status))
    return len(stories)


if __name__ == "__main__":
    found = collect()
    if "--dry-run" in sys.argv:
        print(json.dumps(found, ensure_ascii=False, indent=2))
    else:
        saved = save_to_supabase(found)
        print("Found " + str(len(found)) + " sourced stories; submitted " + str(saved) + " for deduplicated publishing.")
