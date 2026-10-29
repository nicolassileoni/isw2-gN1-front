import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';

import { fonts, palette } from '@/constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.ember,
        tabBarInactiveTintColor: palette.stone,
        tabBarHideOnKeyboard: true,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarAccessibilityLabel: 'Inicio',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'storefront' : 'storefront-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="seguimiento"
        options={{
          title: 'Seguir',
          tabBarAccessibilityLabel: 'Seguir pedido',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'search' : 'search-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="personal"
        options={{
          title: 'Personal',
          tabBarAccessibilityLabel: 'Acceso del personal',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: palette.white,
    borderTopColor: palette.sand,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 6,
  },
  tabLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 0,
  },
});
