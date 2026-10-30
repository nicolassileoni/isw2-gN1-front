import { useEffect, useState } from 'react';
import { Alert, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { palette, radii, shadows, spacing } from '@/constants/theme';

export type AlertButton = {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
};

type AlertState = {
  title: string;
  message?: string;
  buttons: AlertButton[];
};

let currentAlert: AlertState | null = null;
const listeners = new Set<(state: AlertState | null) => void>();

function emit(next: AlertState | null) {
  currentAlert = next;
  listeners.forEach((listener) => listener(next));
}

function closeAlert() {
  emit(null);
}

export function showAlert(title: string, message?: string, buttons?: AlertButton[]): void {
  const normalized = buttons?.length ? buttons : [{ text: 'Aceptar' }];

  if (Platform.OS !== 'web') {
    Alert.alert(title, message, normalized);
    return;
  }

  emit({ title, message, buttons: normalized });
}

export function AlertHost() {
  const [alert, setAlert] = useState<AlertState | null>(currentAlert);

  useEffect(() => {
    const listener = (state: AlertState | null) => setAlert(state);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  if (Platform.OS !== 'web' || !alert) {
    return null;
  }

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={closeAlert}>
      <View style={styles.root}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
          style={StyleSheet.absoluteFill}
          onPress={closeAlert}
        />

        <View accessibilityViewIsModal style={styles.card}>
          <AppText variant="h2">{alert.title}</AppText>
          {alert.message ? (
            <AppText variant="body" color={palette.pewter}>
              {alert.message}
            </AppText>
          ) : null}

          <View style={styles.actions}>
            {alert.buttons.map((button) => (
              <Button
                key={button.text}
                title={button.text}
                variant={
                  button.style === 'destructive'
                    ? 'destructive'
                    : button.style === 'cancel'
                      ? 'secondary'
                      : 'primary'
                }
                style={styles.action}
                onPress={() => {
                  closeAlert();
                  button.onPress?.();
                }}
              />
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: 'rgba(14, 14, 15, 0.35)',
  },
  card: {
    width: '100%',
    maxWidth: 360,
    gap: spacing.md,
    padding: spacing.xxl,
    backgroundColor: palette.white,
    borderRadius: radii.card,
    ...shadows.toast,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  action: {
    flex: 1,
  },
});
