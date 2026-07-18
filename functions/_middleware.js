/**
 * Cloudflare Pages middleware — canonicalize hosts & URLs for Google indexing.
 * Fixes GSC "Page with redirect" noise from www duplicates and path variants.
 */
export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);
  const { pathname, hostname } = url;

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
  //    Skip root, assets, and real files (sitemap.xml, robots.txt, etc.)
  if (
    pathname !== '/' &&
    !pathname.endsWith('/') &&
    !pathname.includes('.')
  ) {
    url.pathname = pathname + '/';
    return Response.redirect(url.toString(), 301);
  }

  return next();
}
