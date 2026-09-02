const SHARE_CACHE = "cft-print-share-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// 拦截 WhatsApp（或其他App）分享文件时发起的 POST 请求
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method === "POST" && url.pathname.endsWith("/index.html")) {
    event.respondWith(handleShare(event.request));
  }
});

async function handleShare(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("shared_files");
    const cache = await caches.open(SHARE_CACHE);

    const meta = [];
    for (let i = 0; i < files.length; i++) {
      const key = "shared-file-" + i;
      await cache.put(key, new Response(files[i]));
      meta.push({ key, name: files[i].name || ("shared-" + i), type: files[i].type });
    }
    await cache.put("shared-meta", new Response(JSON.stringify(meta)));

    return Response.redirect("./index.html?shared=1", 303);
  } catch (err) {
    return Response.redirect("./index.html", 303);
  }
}
