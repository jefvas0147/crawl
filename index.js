const SHEET_ID = "1mjxqT0xK0586JpuN5GxrxHCZaDnYsgatB4e_eJlVD7w";
const SHEET_NAME = "Sheet1";
const CACHE_TTL_SECONDS = 300; // 5-minute edge cache

export default {
  async fetch(request, env, ctx) {
    const incomingUrl = new URL(request.url);

    // Extract slug from path: "https://yourdomain.com/my-slug" -> "my-slug"
    const slug = incomingUrl.pathname.replace(/^\/+|\/+$/g, "").toLowerCase();

    if (!slug) {
      return new Response("Missing slug in path", { status: 400 });
    }

    // 1. Fetch & cache rows from your public Google Sheet
    const rows = await getCachedSheetRows(ctx);

    // 2. Match Column A (index 0 = slug) and grab Column J (index 9 = canonicalUrl)
    let targetBaseUrl = null;
    for (const row of rows) {
      const cells = row.c || [];
      const rowSlug = getCellValue(cells[0]);
      if (rowSlug && rowSlug.toLowerCase() === slug) {
        targetBaseUrl = getCellValue(cells[9]); // Column J: canonicalUrl
        break;
      }
    }

    if (!targetBaseUrl) {
      return new Response("Slug or canonicalUrl not found", { status: 404 });
    }

    // 3. Preserve incoming query parameters (?id=123&token=xyz)
    const finalTarget = targetBaseUrl + incomingUrl.search;

    // 4. Generate 308 permanent redirect on the fly with SEO & canonical headers
    return new Response(null, {
      status: 308,
      headers: {
        "Location": finalTarget,
        "Link": `<${finalTarget}>; rel="canonical"`,
        "Referrer-Policy": "no-referrer",
        "X-Robots-Tag": "index, follow"
      }
    });
  }
};

/**
 * Fetches public Google Sheet data via gviz JSON endpoint and caches at the Edge
 */
async function getCachedSheetRows(ctx) {
  const cacheKey = new Request(`https://internal-sheet-cache.local/${SHEET_ID}/${SHEET_NAME}`);
  const cache = caches.default;

  const cachedResponse = await cache.match(cacheKey);
  if (cachedResponse) {
    return await cachedResponse.json();
  }

  const gvizUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}`;
  const res = await fetch(gvizUrl);
  const rawText = await res.text();

  // Strip Google's JSONP wrapper: /*O_o*/\ngoogle.visualization.Query.setResponse({...});
  const jsonStart = rawText.indexOf("{");
  const jsonEnd = rawText.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1) {
    return [];
  }

  const parsed = JSON.parse(rawText.substring(jsonStart, jsonEnd + 1));
  const rows = (parsed.table && parsed.table.rows) ? parsed.table.rows : [];

  const cacheableResponse = new Response(JSON.stringify(rows), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": `public, max-age=${CACHE_TTL_SECONDS}`
    }
  });

  ctx.waitUntil(cache.put(cacheKey, cacheableResponse));
  return rows;
}

/**
 * Safely extracts trimmed string value from a gviz cell object
 */
function getCellValue(cell) {
  if (!cell || cell.v === null || cell.v === undefined) return null;
  const val = String(cell.v).trim();
  return val === "" ? null : val;
}
