const VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';
const BASE_URL = 'https://story-api.dicoding.dev/v1';

class PushNotification {
  static async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js', {
          scope: '/'
        });
        console.log('Service Worker registered with scope:', registration.scope);
        return registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        throw error;
      }
    }
    throw new Error('Service Worker not supported');
  }

  static async requestNotificationPermission() {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }
      return true;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      throw error;
    }
  }

  static async subscribe() {
    try {
      // First request notification permission
      await this.requestNotificationPermission();

      // Then register service worker
      const registration = await this.registerServiceWorker();
      
      // Check if already subscribed
      let subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        return subscription;
      }

      // Subscribe to push notifications
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      // Send subscription to server
      const response = await fetch(`${BASE_URL}/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh')))),
            auth: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth'))))
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to subscribe to notifications');
      }

      const responseJson = await response.json();
      if (responseJson.error) {
        throw new Error(responseJson.message);
      }

      return responseJson;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      throw error;
    }
  }

  static async unsubscribe() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        
        const response = await fetch(`${BASE_URL}/notifications/subscribe`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            endpoint: subscription.endpoint
          })
        });

        if (!response.ok) {
          throw new Error('Failed to unsubscribe from notifications');
        }

        const responseJson = await response.json();
        if (responseJson.error) {
          throw new Error(responseJson.message);
        }

        return responseJson;
      }
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      throw error;
    }
  }

  static urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

export default PushNotification; 