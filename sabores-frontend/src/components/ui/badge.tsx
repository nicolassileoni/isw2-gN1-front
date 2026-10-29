import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { palette, radii, semantic, spacing } from '@/constants/theme';

export type BadgeTone = 'accent' | 'success' | 'info' | 'warning' | 'danger' | 'neutral';

type BadgeProps = {
  label: string;
  tone?: BadgeTone;
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

export function Badge({ label, tone = 'neutral', style }: BadgeProps) {
  const colors = toneStyles[tone];

  return (
    <View style={[styles.badge, { backgroundColor: colors.backgroundColor }, style]}>
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
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
  },
});
