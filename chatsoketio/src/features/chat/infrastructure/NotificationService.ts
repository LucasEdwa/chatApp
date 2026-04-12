export class NotificationService {
  private permission: NotificationPermission = 'default';

  constructor() {
    this.requestPermission();
  }

  async requestPermission(): Promise<void> {
    if ('Notification' in window) {
      this.permission = await Notification.requestPermission();
    }
  }

  showNotification(title: string, options?: NotificationOptions): void {
    if (this.permission === 'granted' && 'Notification' in window) {
      // Check if the page is visible
      if (document.hidden) {
        new Notification(title, {
          icon: '/vite.svg', // Use the vite logo as the icon
          badge: '/vite.svg',
          tag: 'chat-message', // Prevent multiple notifications
          ...options
        });
      }
    }
  }

  showMessageNotification(userName: string, message: string, isPrivate: boolean = false): void {
    const title = isPrivate ? `Private message from ${userName}` : `${userName} in Public Chat`;
    this.showNotification(title, {
      body: message,
      icon: '/vite.svg',
      tag: `chat-${isPrivate ? 'private' : 'public'}`,
      requireInteraction: false,
      silent: false
    });
  }
}

export const notificationService = new NotificationService();
