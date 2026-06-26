const CACHE_VERSION = "cnl-service-v3";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const IS_LOCAL_DEV =
  ["localhost", "127.0.0.1"].includes(self.location.hostname) ||
  /^192\.168\./.test(self.location.hostname) ||
  /^10\./.test(self.location.hostname) ||
  /^172\.(1[6-9]|2\d|3[0-1])\./.test(self.location.hostname);

const STATIC_ASSETS = [
  "/manifest.webmanifest",
  "/offline.html",
  "/icons/icon-192.svg",
  "/icons/icon-512.svg",
  "/icons/icon-maskable.svg",
  "/brand/cnl-service-logo.png"
];

const PUBLIC_SHELL_ROUTES = ["/", "/services", "/booking", "/report-issue", "/track", "/warranty"];
const PRIVATE_PATH_PREFIXES = ["/customer", "/dashboard", "/technician", "/admin", "/login"];

self.addEventListener("install", (event) => {
  if (IS_LOCAL_DEV) {
    self.skipWaiting();
    return;
  }

  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)),
      caches.open(SHELL_CACHE).then((cache) => cache.addAll(PUBLIC_SHELL_ROUTES))
    ]).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  if (IS_LOCAL_DEV) {
    event.waitUntil(
      caches
        .keys()
        .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
        .then(() => self.registration.unregister())
        .then(() => self.clients.claim())
    );
    return;
  }

  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => !key.startsWith(CACHE_VERSION)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

function isSupabaseRequest(url) {
  return url.hostname.endsWith(".supabase.co") || url.pathname.includes("/auth/v1") || url.pathname.includes("/rest/v1") || url.pathname.includes("/storage/v1");
}

function isPrivateRoute(pathname) {
  return PRIVATE_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function isStaticAsset(request, url) {
  return (
    request.destination === "script" ||
    request.destination === "style" ||
    request.destination === "font" ||
    request.destination === "image" ||
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/brand/")
  );
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirstShell(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(SHELL_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return (await caches.match(request)) || (await caches.match("/offline.html")) || Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  if (IS_LOCAL_DEV) return;

  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET") return;
  if (isSupabaseRequest(url)) return;
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    if (isPrivateRoute(url.pathname)) {
      event.respondWith(fetch(request).catch(() => caches.match("/offline.html")));
      return;
    }

    event.respondWith(networkFirstShell(request));
    return;
  }

  if (isStaticAsset(request, url)) {
    event.respondWith(cacheFirst(request));
  }
});
