const CACHE_NAME = 'restaurant-app-v1';
const BASE_PATH = window.location.hostname === 'localhost' ? './' : '/tambahCerita/';

const urlsToCache = [
  BASE_PATH,
  `${BASE_PATH}index.html`,
  `${BASE_PATH}manifest.json`,
  `${BASE_PATH}css/styles.css`,
  `${BASE_PATH}js/main.js`,
  `${BASE_PATH}js/db.js`,
  `${BASE_PATH}js/idb.js`,
  `${BASE_PATH}js/restaurant_info.js`,
  `${BASE_PATH}js/restaurant_list.js`,
  `${BASE_PATH}js/register-sw.js`,
  `${BASE_PATH}data/restaurants.json`,
  `${BASE_PATH}img/1.jpg`,
  `${BASE_PATH}img/2.jpg`,
  `${BASE_PATH}img/3.jpg`,
  `${BASE_PATH}img/4.jpg`,
  `${BASE_PATH}img/5.jpg`,
  `${BASE_PATH}img/6.jpg`,
  `${BASE_PATH}img/7.jpg`,
  `${BASE_PATH}img/8.jpg`,
  `${BASE_PATH}img/9.jpg`,
  `${BASE_PATH}img/10.jpg`,
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            return response;
          });
      })
  );
}); 