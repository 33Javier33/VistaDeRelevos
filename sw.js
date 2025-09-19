// sw.js - El trabajador en segundo plano

// Evento 'install': Se dispara cuando el SW se instala por primera vez.
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalado');
  // self.skipWaiting() fuerza al SW a activarse inmediatamente.
  self.skipWaiting();
});

// Evento 'activate': Se dispara cuando el SW se activa.
// Es un buen lugar para limpiar cachés viejos si los hubiera.
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activado');
  // clients.claim() permite que el SW tome control de la página inmediatamente.
  event.waitUntil(self.clients.claim());
});

// Evento 'push': ¡El más importante! Se dispara cuando llega una notificación push del servidor.
self.addEventListener('push', (event) => {
  console.log('Service Worker: Notificación Push recibida.');

  let data = { title: 'Notificación', body: 'No se ha enviado contenido.', icon: 'icons/icon-192.png' };
  try {
    // Intentamos parsear los datos que envía el servidor.
    data = event.data.json();
  } catch (e) {
    console.error('Error al parsear los datos de la notificación:', e);
  }

  const title = data.title || 'Visualizador de Horarios';
  const options = {
    body: data.body || 'Hay una nueva actualización.',
    icon: data.icon || 'icons/icon-192.png', // Usamos tu ícono por defecto
    badge: 'icons/icon-192.png', // Un ícono pequeño para la barra de estado
    vibrate: [100, 50, 100], // Patrón de vibración [vibra, pausa, vibra]
    data: { // Datos adicionales que quieras pasar
        url: data.url || '/' 
    }
  };

  // Le decimos al SW que espere hasta que la notificación se haya mostrado.
  event.waitUntil(self.registration.showNotification(title, options));
});

// Evento 'notificationclick': Se dispara cuando el usuario hace clic en la notificación.
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Clic en la notificación recibido.');

  // Cerramos la notificación.
  event.notification.close();

  const urlToOpen = event.notification.data.url || '/';

  // Buscamos si ya hay una ventana de la app abierta.
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Si encontramos una ventana, la enfocamos.
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Si no, abrimos una nueva ventana.
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});