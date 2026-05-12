const CACHE_NAME = "vetatende-premium-v2";

const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// ====================================
// INSTALAÇÃO
// ====================================

self.addEventListener("install", (event) => {

  console.log("Service Worker instalado");

  event.waitUntil(

    caches.open(CACHE_NAME)
      .then((cache) => {

        console.log("Arquivos em cache");

        return cache.addAll(urlsToCache);

      })

  );

});

// ====================================
// ATIVAÇÃO
// ====================================

self.addEventListener("activate", (event) => {

  console.log("Service Worker ativado");

  event.waitUntil(

    caches.keys().then((cacheNames) => {

      return Promise.all(

        cacheNames.map((cache) => {

          if (cache !== CACHE_NAME) {

            console.log("Cache antigo removido");

            return caches.delete(cache);

          }

        })

      );

    })

  );

});

// ====================================
// FETCH
// ====================================

self.addEventListener("fetch", (event) => {

  event.respondWith(

    caches.match(event.request)
      .then((response) => {

        // RETORNA CACHE
        if (response) {
          return response;
        }

        // BUSCA ONLINE
        return fetch(event.request)
          .then((response) => {

            // NÃO CACHEIA SE NÃO FOR VÁLIDO
            if (
              !response ||
              response.status !== 200 ||
              response.type !== "basic"
            ) {
              return response;
            }

            const responseClone = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {

                cache.put(
                  event.request,
                  responseClone
                );

              });

            return response;

          });

      })

  );

});

// ====================================
// PUSH NOTIFICATION
// ====================================

self.addEventListener("push", (event) => {

  const titulo = "VetAtende";

  const opcoes = {
    body: event.data
      ? event.data.text()
      : "Você possui notificações pendentes.",
    icon: "./icon-192.png",
    badge: "./icon-192.png",
    vibrate: [200, 100, 200]
  };

  event.waitUntil(

    self.registration.showNotification(
      titulo,
      opcoes
    )

  );

});

// ====================================
// CLICK NA NOTIFICAÇÃO
// ====================================

self.addEventListener("notificationclick", (event) => {

  event.notification.close();

  event.waitUntil(

    clients.openWindow("./index.html")

  );

});