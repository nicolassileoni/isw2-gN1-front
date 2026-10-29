import { Text, type TextProps } from 'react-native';

import { palette, typography, type TypographyVariant } from '@/constants/theme';

type AppTextProps = TextProps & {
  variant?: TypographyVariant;
  color?: string;
};

export function AppText({
  variant = 'body',
  color = palette.ink,
  style,
  ...rest
}: AppTextProps) {
  return <Text {...rest} style={[typography[variant], { color }, style]} />;
}
