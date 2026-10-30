import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';

import { fonts, palette } from '@/constants/theme';
import { useSession } from '@/features/session/session-context';

export default function TabsLayout() {
  const { user, isAdmin } = useSession();
  const publico = !user;

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
      {/* Área pública */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          href: publico ? undefined : null,
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
          href: publico ? undefined : null,
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
          href: publico ? undefined : null,
          tabBarAccessibilityLabel: 'Acceso del personal',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
          ),
        }}
      />

      {/* Área del personal */}
      <Tabs.Screen
        name="pedidos"
        options={{
          title: 'Pedidos',
          href: publico ? null : undefined,
          tabBarAccessibilityLabel: 'Pedidos',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'receipt' : 'receipt-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="en-calle"
        options={{
          title: 'En la calle',
          href: publico ? null : undefined,
          tabBarAccessibilityLabel: 'Pedidos en la calle',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'bicycle' : 'bicycle-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="gestion"
        options={{
          title: 'Gestión',
          href: isAdmin ? undefined : null,
          tabBarAccessibilityLabel: 'Gestión',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'settings' : 'settings-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="cuenta"
        options={{
          title: 'Cuenta',
          href: publico ? null : undefined,
          tabBarAccessibilityLabel: 'Mi cuenta',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'person-circle' : 'person-circle-outline'}
              size={size}
              color={color}
            />
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
