import { AuthContextProvider, useAuth } from '@/context/authContext'
import { Slot, useRouter, useSegments } from 'expo-router'
import React, { useEffect, useRef } from 'react'
import * as Notifications from 'expo-notifications'
import { registerForPushNotificationsAsync, savePushToken } from '@/services/pushNotificationService'
import "../global.css"

const MainLayout = () => {
    const { isAuthenticated, user } = useAuth();
    const segments = useSegments();
    const router = useRouter();
    const notificationListener = useRef<Notifications.EventSubscription>();
    const responseListener = useRef<Notifications.EventSubscription>();

    useEffect(() => {
        // check if user is authenticated or not
        if (typeof isAuthenticated == 'undefined') return;
        const inApp = segments[0] == '(app)';
        if (isAuthenticated && !inApp) {
            // redirect to home
            router.replace('/(app)/(tabs)/chats');
        } else if (isAuthenticated == false) {
            // redirect to app
            router.replace('/logIn');
        }
    }, [isAuthenticated]);

    // Register push token and set up notification listeners when authenticated
    useEffect(() => {
        if (!isAuthenticated || !user?.uid) return;

        // Register push token if notifications are enabled
        if (user.notificationsEnabled !== false) {
            (async () => {
                try {
                    const token = await registerForPushNotificationsAsync();
                    if (token && token !== user.expoPushToken) {
                        await savePushToken(user.uid, token);
                    }
                } catch (e) {
                    console.log('Push token registration skipped:', e);
                }
            })();
        }

        // Listen for notifications received while app is foregrounded
        notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
            // Notification received in foreground -- handled by setNotificationHandler in pushNotificationService
            console.log('Notification received:', notification.request.content.title);
        });

        // Listen for user tapping on a notification
        responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
            const data = response.notification.request.content.data;
            if (data?.chatId) {
                router.push(`/(app)/chat/${data.chatId}` as any);
            }
        });

        return () => {
            if (notificationListener.current) {
                Notifications.removeNotificationSubscription(notificationListener.current);
            }
            if (responseListener.current) {
                Notifications.removeNotificationSubscription(responseListener.current);
            }
        };
    }, [isAuthenticated, user?.uid]);

    return <Slot />
}

export default function RootLayout() {
  return (
    <AuthContextProvider>
      <MainLayout />
    </AuthContextProvider>
  )
}