import { StyleSheet, View, type ViewProps } from 'react-native';

import { palette, radii, spacing } from '@/constants/theme';

type CardProps = ViewProps & {
  padding?: number;
};

export function Card({ children, padding = spacing.lg, style, ...rest }: CardProps) {
  return (
    <View style={[styles.card, { padding }, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.white,
    borderColor: palette.sand,
    borderWidth: 1,
    borderRadius: radii.card,
  },
});
