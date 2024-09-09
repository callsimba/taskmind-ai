// Import Task type from where it's defined (e.g., TaskManager.tsx or types.ts)
import { Task } from '@/app/components/TaskManager'; // Adjust the path based on your project structure

export function useNotifications() {
  const requestNotificationPermission = async () => {
    if (Notification.permission === 'granted') {
      return true;
    }
    
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  };

  const scheduleNotification = async (task: Task) => {
    if (Notification.permission !== 'granted') {
      console.warn('Notifications permission not granted.');
      return;
    }

    const notificationOptions: NotificationOptions = {
      body: `Reminder for your task: ${task.title}`,
      icon: '/path/to/icon.png',  // Example icon path
    };

    try {
      await new Notification(task.title, notificationOptions);
    } catch (error) {
      console.error('Notification failed to schedule:', error);
    }
  };

  return { requestNotificationPermission, scheduleNotification };
}
