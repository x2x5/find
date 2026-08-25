const ALLOWED_ORIGINS = new Set([
  "https://x2x5.top",
  "https://www.x2x5.top",
  "https://x2x5.github.io",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

function corsHeaders(request) {
  const origin = request.headers.get("Origin") || "";
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.has(origin)
      ? origin
      : "https://x2x5.github.io",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(request, value, status = 200, cacheControl = "no-store") {
  return new Response(JSON.stringify(value), {
    status,
    headers: {
      ...corsHeaders(request),
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": cacheControl,
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function decodeXml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));
}

function normalizeTitle(value) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function similarity(left, right) {
  const a = new Set(normalizeTitle(left).split(" ").filter(Boolean));
  const b = new Set(normalizeTitle(right).split(" ").filter(Boolean));
  if (!a.size || !b.size) return 0;
  let common = 0;
  for (const word of a) if (b.has(word)) common += 1;
  return common / new Set([...a, ...b]).size;
}

function parseEntries(xml) {
  return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].flatMap(
    ([, entry]) => {
      const id = entry.match(/<id>https?:\/\/arxiv\.org\/abs\/([^<]+)<\/id>/)?.[1];
      const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1];
      if (!id || !title) return [];
      return [{
        id: id.replace(/v\d+$/, ""),
        title: decodeXml(title).replace(/\s+/g, " ").trim(),
      }];
    },
  );
}

async function searchArxiv(request, title, context) {
  const cacheKey = new Request(
    `https://find-arxiv-cache.invalid/${encodeURIComponent(normalizeTitle(title))}`,
  );
  const cache = caches.default;
  const cached = await cache.match(cacheKey);
  if (cached) {
    const headers = new Headers(cached.headers);
    for (const [name, value] of Object.entries(corsHeaders(request))) {
      headers.set(name, value);
    }
    return new Response(cached.body, {
      status: cached.status,
      headers,
    });
  }

  const query = `ti:"${title.replace(/["\\]/g, " ")}"`;
  const endpoint = new URL("https://export.arxiv.org/api/query");
  endpoint.searchParams.set("search_query", query);
  endpoint.searchParams.set("start", "0");
  endpoint.searchParams.set("max_results", "8");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  let response;
  try {
    response = await fetch(endpoint, {
      headers: { "User-Agent": "find-arxiv/1.0 (https://x2x5.top/find/)" },
      signal: controller.signal,
    });
  } catch {
    return json(request, { error: "arXiv timeout" }, 504);
  } finally {
    clearTimeout(timeout);
  }
  if (!response.ok) return json(request, { error: "arXiv unavailable" }, 502);

  const entries = parseEntries(await response.text());
  const normalized = normalizeTitle(title);
  const exact = entries.find((item) => normalizeTitle(item.title) === normalized);
  const ranked = entries
    .map((item) => ({ ...item, score: similarity(title, item.title) }))
    .sort((a, b) => b.score - a.score);
  const match = exact ?? (ranked[0]?.score >= 0.9 ? ranked[0] : null);
  const result = match
    ? json(request, { id: match.id, title: match.title }, 200, "public, max-age=86400")
    : json(request, { error: "No reliable match" }, 404, "public, max-age=3600");

  context.waitUntil(cache.put(cacheKey, result.clone()));
  return result;
}

export default {
  async fetch(request, _env, context) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }
    if (request.method !== "GET") return json(request, { error: "Method not allowed" }, 405);

    const url = new URL(request.url);
    if (url.pathname === "/") {
      return json(request, { service: "find-arxiv", status: "ok" });
    }
    if (url.pathname !== "/search") return json(request, { error: "Not found" }, 404);

    const title = url.searchParams.get("title")?.trim() || "";
    if (title.length < 4 || title.length > 500) {
      return json(request, { error: "Invalid title" }, 400);
    }
    return searchArxiv(request, title, context);
  },
};
