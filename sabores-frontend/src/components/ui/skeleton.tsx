import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { palette, radii } from '@/constants/theme';

type SkeletonProps = {
  width?: ViewStyle['width'];
  height?: ViewStyle['height'];
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

export function Skeleton({ width = '100%', height = 16, radius = radii.input, style }: SkeletonProps) {
  return <View style={[styles.block, { width, height, borderRadius: radius }, style]} />;
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: palette.fog,
    opacity: 0.9,
  },
});
