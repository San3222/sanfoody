import { useEffect, useState } from 'react'

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setIsSupported(true)
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = async () => {
    if (!isSupported) {
      alert('Push notifications are not supported in this browser')
      return false
    }

    const result = await Notification.requestPermission()
    setPermission(result)
    return result === 'granted'
  }

  const subscribeToPush = async () => {
    const granted = await requestPermission()
    if (!granted) return null

    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: 'YOUR_VAPID_PUBLIC_KEY', // Backend se lo
    })

    return subscription
  }

  const showLocalNotification = (title: string, body: string, url?: string) => {
    if (permission !== 'granted') return
    
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, {
        body,
        icon: '/icons/icon-192x192.png',
        data: url || '/',
      })
    })
  }

  return {
    permission,
    isSupported,
    requestPermission,
    subscribeToPush,
    showLocalNotification,
  }
}