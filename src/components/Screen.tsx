import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../theme/useTheme';

export interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export function Screen({ children, scroll = false, padded = true, style, contentContainerStyle }: ScreenProps) {
  const { colors, space } = useTheme();
  const insets = useSafeAreaInsets();

  const content = [
    padded && { paddingHorizontal: space.screenPadding },
    { paddingTop: insets.top },
  ];

  if (scroll) {
    return (
      <View style={[styles.flex, { backgroundColor: colors.bg }, style]}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[content, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  return <View style={[styles.flex, { backgroundColor: colors.bg }, content, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
