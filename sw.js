/* TutorJava - guarda la app en el celular para que funcione sin internet */

const VERSION = "tutorjava-v1";
const ARCHIVOS = [
    "./",
    "./index.html",
    "./manifest.webmanifest",
    "./icono-192.png",
    "./icono-512.png",
    "./icono-maskable-512.png",
    "./apple-touch-icon.png"
];

// Al instalarse, guarda todos los archivos de la app
self.addEventListener("install", evento => {
    evento.waitUntil(
        caches.open(VERSION).then(cache => cache.addAll(ARCHIVOS)).then(() => self.skipWaiting())
    );
});

// Borra versiones viejas guardadas
self.addEventListener("activate", evento => {
    evento.waitUntil(
        caches.keys()
            .then(claves => Promise.all(claves.filter(c => c !== VERSION).map(c => caches.delete(c))))
            .then(() => self.clients.claim())
    );
});

// Con internet: trae la versión nueva y la guarda. Sin internet: usa la guardada.
self.addEventListener("fetch", evento => {
    const pedido = evento.request;
    if (pedido.method !== "GET" || new URL(pedido.url).origin !== self.location.origin) return;

    evento.respondWith(
        fetch(pedido)
            .then(respuesta => {
                if (respuesta && respuesta.ok) {
                    const copia = respuesta.clone();
                    caches.open(VERSION).then(cache => cache.put(pedido, copia));
                }
                return respuesta;
            })
            .catch(() =>
                caches.match(pedido, { ignoreSearch: true }).then(guardada =>
                    guardada || (pedido.mode === "navigate" ? caches.match("./index.html") : undefined)
                )
            )
    );
});
