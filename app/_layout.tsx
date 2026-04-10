import { AuthContextProvider, useAuth } from '@/context/authContext'
import { Slot, useRouter, useSegments } from 'expo-router'
import React, { useEffect } from 'react'
import "../global.css"

const MainLayout = () => {
    const { isAuthenticated, user } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        // check if user is authenticated or not
        if (typeof isAuthenticated == 'undefined') return;
        const inApp = segments[0] == '(app)';
        const inOnboarding = segments[0] == 'onboarding';
        if (isAuthenticated) {
            // Suspended user: authContext listener will sign them out
            if (user?.status === 'suspended') return;

            if (user?.onboarded === false && !inOnboarding) {
                // New user complete profile first
                router.replace('/onboarding');
            } else if (user?.onboarded !== false && !inApp) {
                // Existing or onboarded user go to app
                router.replace('/(app)/(tabs)/chats');
            }
        } else if (isAuthenticated == false) {
            router.replace('/logIn');
        }
    }, [isAuthenticated, user?.onboarded]);

    return <Slot />
}

export default function RootLayout() {
    return (
        <AuthContextProvider>
            <MainLayout />
        </AuthContextProvider>
    )
}
