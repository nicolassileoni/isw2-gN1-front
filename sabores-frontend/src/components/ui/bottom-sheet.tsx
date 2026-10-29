import { type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { IconButton } from '@/components/ui/icon-button';
import { palette, radii, shadows, spacing } from '@/constants/theme';

type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function BottomSheet({ visible, onClose, title, children, footer }: BottomSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboard}>
          <View
            accessibilityViewIsModal
            style={[styles.sheet, { paddingBottom: insets.bottom + spacing.xl }]}>
            <View style={styles.handle} />

            {title ? (
              <View style={styles.header}>
                <AppText variant="h2" style={styles.title}>
                  {title}
                </AppText>
                <IconButton name="close" label="Cerrar" onPress={onClose} variant="soft" />
              </View>
            ) : null}

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.body}>
              {children}
            </ScrollView>

            {footer ? <View style={styles.footer}>{footer}</View> : null}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(14, 14, 15, 0.35)',
  },
  keyboard: {
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '88%',
    backgroundColor: palette.white,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xl,
    ...shadows.sheet,
  },
  handle: {
    width: 36,
    height: 4,
    alignSelf: 'center',
    borderRadius: radii.pill,
    backgroundColor: palette.driftwood,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  title: {
    flex: 1,
  },
  body: {
    paddingBottom: spacing.md,
  },
  footer: {
    gap: spacing.md,
    paddingTop: spacing.md,
  },
});
