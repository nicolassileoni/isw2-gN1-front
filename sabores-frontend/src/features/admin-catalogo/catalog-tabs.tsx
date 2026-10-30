import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { palette, radii, spacing } from '@/constants/theme';

type CatalogTab = 'locales' | 'productos';

const TABS: { key: CatalogTab; label: string; href: '/(tabs)/gestion/catalogo' | '/(tabs)/gestion/productos' }[] = [
  { key: 'locales', label: 'Locales', href: '/(tabs)/gestion/catalogo' },
  { key: 'productos', label: 'Productos', href: '/(tabs)/gestion/productos' },
];

export function CatalogTabs({ active }: { active: CatalogTab }) {
  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const selected = active === tab.key;

        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected }}
            onPress={() => {
              if (!selected) router.replace(tab.href);
            }}
            style={({ pressed }) => [
              styles.tab,
              selected && styles.selected,
              pressed && !selected && styles.pressed,
            ]}>
            <AppText variant="label" color={selected ? palette.ink : palette.slate}>
              {tab.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.xs,
    backgroundColor: palette.fog,
    borderRadius: radii.pill,
  },
  tab: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
  },
  selected: {
    backgroundColor: palette.ember,
  },
  pressed: {
    opacity: 0.75,
  },
});
