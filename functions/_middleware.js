/**
 * Cloudflare Pages middleware — canonicalize hosts & URLs for Google indexing.
 * Strict uniqueness rule: only clean trailing-slash URLs are indexable.
 * Prefill/UTM query variants stay usable for humans but must not create
 * duplicate indexed "pages".
 */
export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);
  const { pathname, hostname, searchParams } = url;

  // 1) www → apex (both currently return 200 = duplicate host risk)
  if (hostname === 'www.herminox.com') {
    url.hostname = 'herminox.com';
    return Response.redirect(url.toString(), 301);
  }

  // 2) GSC HTML verification must be HTTP 200 at the exact *.html URL (no 308)
  if (pathname === '/google4bcee3eb037f4dd1.html' && env.ASSETS) {
    const assetReq = new Request(new URL('/google4bcee3eb037f4dd1', url), request);
    return env.ASSETS.fetch(assetReq);
  }

  // 3) *.html → clean trailing-slash URLs (301, permanent)
  if (pathname.endsWith('.html')) {
    let dest;
    if (pathname === '/index.html') dest = '/';
    else if (pathname.endsWith('/index.html')) dest = pathname.slice(0, -'index.html'.length);
    else dest = pathname.replace(/\.html$/, '/');
    if (!dest.endsWith('/')) dest += '/';
    url.pathname = dest;
    return Response.redirect(url.toString(), 301);
  }

  // 4) Extensionless paths without trailing slash → add slash
  if (
    pathname !== '/' &&
    !pathname.endsWith('/') &&
    !pathname.includes('.')
  ) {
    url.pathname = pathname + '/';
    return Response.redirect(url.toString(), 301);
  }

  const response = await next();

  // 5) Strict uniqueness: any URL with a query string on tool/guide/embed
  //    surfaces is noindex (prefill + UTM must not enter Google as extra pages).
  //    Canonical HTML already points at the clean path; this reinforces it.
  const indexedRoots = ['/sellers/', '/buyers/', '/guides/', '/embed/'];
  const isSensitivePath = indexedRoots.some(
    (root) => pathname === root || pathname.startsWith(root)
  );
  if (isSensitivePath && [...searchParams.keys()].length > 0) {
    const headers = new Headers(response.headers);
    headers.set('X-Robots-Tag', 'noindex, follow');
    // Help crawlers converge on the clean URL
    const clean = new URL(url.toString());
    clean.search = '';
    clean.hash = '';
    headers.set('Link', '<' + clean.toString() + '>; rel="canonical"');
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  return response;
}
