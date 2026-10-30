import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { palette, radii, semantic, spacing } from '@/constants/theme';

export type BadgeTone = 'accent' | 'success' | 'info' | 'warning' | 'danger' | 'neutral';

type BadgeProps = {
  label: string;
  tone?: BadgeTone;
  /** DESIGN 8.14: el estado nunca se comunica solo con color. */
  icon?: ComponentProps<typeof Ionicons>['name'];
  style?: StyleProp<ViewStyle>;
};

const toneStyles: Record<BadgeTone, { backgroundColor: string; color: string }> = {
  accent: { backgroundColor: palette.peach, color: palette.ink },
  success: { backgroundColor: semantic.successSoft, color: palette.success },
  info: { backgroundColor: semantic.infoSoft, color: palette.info },
  warning: { backgroundColor: semantic.warningSoft, color: palette.warning },
  danger: { backgroundColor: semantic.dangerSoft, color: palette.danger },
  neutral: { backgroundColor: semantic.neutralSoft, color: palette.slate },
};

export function Badge({ label, tone = 'neutral', icon, style }: BadgeProps) {
  const colors = toneStyles[tone];

  return (
    <View style={[styles.badge, { backgroundColor: colors.backgroundColor }, style]}>
      {icon ? <Ionicons name={icon} size={14} color={colors.color} /> : null}
      <AppText variant="overline" color={colors.color}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minHeight: 26,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
  },
});
