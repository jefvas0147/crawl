export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const targetUrl = "https://script.google.com/macros/s/AKfycby3EkWdDHOIw-VsRNJg9rnIXgRRIUolJJRmj4gTxjP6sG6_gylljgn9GPh9Vc-dXjr-zg/exec?new=live-stream";

    // ==========================================
    // VECTOR 3: Dynamic XML Sitemap Generation
    // ==========================================
    if (url.pathname === '/sitemap.xml') {
      const currentTimestamp = new Date().toISOString();
      const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${targetUrl}</loc>
    <lastmod>${currentTimestamp}</lastmod>
  </url>
</urlset>`;

      return new Response(sitemapXml, {
        status: 200,
        headers: {
          'Content-Type': 'application/xml; charset=UTF-8',
          'Cache-Control': 'no-store, max-age=0'
        }
      });
    }

    // ==========================================
    // VECTOR 1: Global Header & Navigation DOM Injection
    // ==========================================
    const htmlPayload = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Instant Crawler Verification Feed</title>
  <meta name="description" content="Real-time programmatic SEO feed testing instant Googlebot crawling vectors.">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
</head>
<body>
  <!-- Top-level structural header placing target link first in DOM hierarchy -->
  <header style="background:#090d16;color:#ffffff;padding:14px 24px;border-bottom:1px solid #1e293b;font-family:sans-serif;">
    <nav>
      <a href="${targetUrl}" rel="external" style="color:#38bdf8;text-decoration:none;font-weight:600;font-size:14px;">
        Live Target Stream: ${targetUrl}
      </a>
    </nav>
  </header>
  
  <main style="max-width:800px;margin:40px auto;padding:0 20px;font-family:sans-serif;color:#334155;">
    <h1>Programmatic SEO Crawl Test Node</h1>
    <p>This node actively broadcasts pre-DOM HTTP headers, top-level header DOM injection, and real-time sitemaps.</p>
  </main>
</body>
</html>`;

    // ==========================================
    // VECTOR 2: HTTP Link Header Pre-DOM Injection
    // ==========================================
    return new Response(htmlPayload, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=UTF-8',
        'Link': `<${targetUrl}>; rel="preload"`,
        'X-Robots-Tag': 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
      }
    });
  }
};
