import { Stack } from 'expo-router';

import { palette } from '@/constants/theme';

export default function GestionLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: palette.canvas },
        animation: 'slide_from_right',
      }}
    />
  );
}
