import {
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { layout, palette, spacing } from '@/constants/theme';

type ScreenProps = ViewProps & {
  scroll?: boolean;
  padded?: boolean;
  edges?: Edge[];
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export function Screen({
  children,
  scroll = false,
  padded = true,
  edges = ['top', 'bottom'],
  contentContainerStyle,
  style,
  ...rest
}: ScreenProps) {
  // `contentContainerStyle` agrupa el contenido (no el ScrollView) para que los
  // gaps y el centrado se apliquen igual en pantallas con y sin scroll.
  const content = (
    <View
      style={[
        styles.inner,
        !scroll && styles.fill,
        padded && styles.padded,
        contentContainerStyle,
        style,
      ]}
      {...rest}>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={edges}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          automaticallyAdjustKeyboardInsets
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.canvas,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
  inner: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    flexGrow: 1,
  },
  fill: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: layout.screenGutter,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
});
