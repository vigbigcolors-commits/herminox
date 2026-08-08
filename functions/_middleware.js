/**
 * Cloudflare Pages middleware — canonicalize hosts & URLs for Google indexing.
 * Strict uniqueness rule: only clean trailing-slash apex URLs are indexable.
 * Prefill/UTM query variants stay usable for humans but must not create
 * duplicate indexed "pages".
 */
export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);
  const { pathname, hostname, searchParams } = url;

  // 1) Non-production hosts → apex (www + Cloudflare Pages project host).
  //    pages.dev returning 200 with apex canonical = GSC
  //    "Alternate page with proper canonical tag".
  if (hostname === 'www.herminox.com' || hostname === 'herminox.pages.dev') {
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

  // 4) /…/index and /…/index/ → clean directory (avoid /path/index/ soft-dupes)
  if (pathname === '/index' || pathname === '/index/') {
    url.pathname = '/';
    return Response.redirect(url.toString(), 301);
  }
  if (pathname.endsWith('/index') || pathname.endsWith('/index/')) {
    url.pathname = pathname.replace(/\/index\/?$/, '/');
    return Response.redirect(url.toString(), 301);
  }

  // 5) Extensionless paths without trailing slash → add slash
  if (
    pathname !== '/' &&
    !pathname.endsWith('/') &&
    !pathname.includes('.')
  ) {
    url.pathname = pathname + '/';
    return Response.redirect(url.toString(), 301);
  }

  const response = await next();
  const headers = new Headers(response.headers);
  let mutated = false;

  // Preview deploy hosts (hash.herminox.pages.dev): never index.
  if (hostname.endsWith('.pages.dev')) {
    headers.set('X-Robots-Tag', 'noindex, follow');
    mutated = true;
  }

  // 6) Any URL with a query string on HTML surfaces is noindex
  //    (prefill + UTM must not enter Google as extra pages).
  //    Canonical HTML already points at the clean path; reinforce via Link.
  const contentType = headers.get('content-type') || '';
  const looksHtml =
    contentType.includes('text/html') ||
    pathname === '/' ||
    pathname.endsWith('/');
  if (looksHtml && [...searchParams.keys()].length > 0) {
    headers.set('X-Robots-Tag', 'noindex, follow');
    const clean = new URL(url.toString());
    clean.hostname = 'herminox.com';
    clean.protocol = 'https:';
    clean.search = '';
    clean.hash = '';
    headers.set('Link', '<' + clean.toString() + '>; rel="canonical"');
    mutated = true;
  }

  if (!mutated) return response;

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
