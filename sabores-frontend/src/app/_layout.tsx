import { DMSans_500Medium, DMSans_600SemiBold } from '@expo-google-fonts/dm-sans';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { fonts, palette } from '@/constants/theme';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    [fonts.display]: DMSans_500Medium,
    [fonts.displaySemibold]: DMSans_600SemiBold,
    [fonts.body]: Inter_400Regular,
    [fonts.bodyMedium]: Inter_500Medium,
    [fonts.bodySemibold]: Inter_600SemiBold,
  });

  useEffect(() => {
    if (loaded || error) {
      void SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: palette.canvas },
          animation: 'slide_from_right',
        }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="local/[id]"
          options={{
            headerShown: true,
            title: 'Carta',
            headerStyle: { backgroundColor: palette.canvas },
            headerTintColor: palette.ink,
            headerShadowVisible: false,
            headerTitleStyle: { fontFamily: fonts.display, fontSize: 18 },
          }}
        />
        <Stack.Screen
          name="+not-found"
          options={{
            headerShown: true,
            title: 'No encontrado',
            headerStyle: { backgroundColor: palette.canvas },
            headerTintColor: palette.ink,
            headerShadowVisible: false,
          }}
        />
      </Stack>
    </>
  );
}
