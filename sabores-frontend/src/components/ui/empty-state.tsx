import { Ionicons } from '@expo/vector-icons';
import { type ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';

import { BrandLogo } from '@/components/brand-logo';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { palette, radii, spacing } from '@/constants/theme';

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: ComponentProps<typeof Ionicons>['name'];
  /** Muestra la mascota en lugar del ícono, para los vacíos principales. */
  brand?: boolean;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  title,
  description,
  icon = 'storefront-outline',
  brand = false,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {brand ? (
        <BrandLogo variant="mascot" width={96} style={styles.mascot} />
      ) : (
        <View style={styles.iconCircle}>
          <Ionicons name={icon} size={30} color={palette.stone} />
        </View>
      )}
      <AppText variant="h3" style={styles.title}>
        {title}
      </AppText>
      {description ? (
        <AppText variant="body" color={palette.warmGray} style={styles.description}>
          {description}
        </AppText>
      ) : null}
      {actionLabel && onAction ? (
        <Button title={actionLabel} variant="secondary" onPress={onAction} style={styles.action} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.empty,
    paddingHorizontal: spacing.xxl,
    gap: spacing.md,
  },
  iconCircle: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.fog,
    borderRadius: radii.pill,
    marginBottom: spacing.sm,
  },
  mascot: {
    marginBottom: spacing.sm,
  },
  title: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
  },
  action: {
    marginTop: spacing.sm,
  },
});
