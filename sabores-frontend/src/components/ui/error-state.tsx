import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { palette, radii, semantic, spacing } from '@/constants/theme';

type ErrorStateProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = 'Algo salió mal',
  message = 'No pudimos cargar la información. Revisá tu conexión e intentá de nuevo.',
  onRetry,
}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name="alert-circle-outline" size={30} color={palette.danger} />
      </View>
      <AppText variant="h3" style={styles.title}>
        {title}
      </AppText>
      <AppText variant="body" color={palette.warmGray} style={styles.message}>
        {message}
      </AppText>
      {onRetry ? (
        <Button title="Reintentar" variant="secondary" onPress={onRetry} style={styles.action} />
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
    backgroundColor: semantic.dangerSoft,
    borderRadius: radii.pill,
    marginBottom: spacing.sm,
  },
  title: {
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
  },
  action: {
    marginTop: spacing.sm,
  },
});
