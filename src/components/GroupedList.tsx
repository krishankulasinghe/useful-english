import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import { View } from 'react-native';

import { useTheme } from '../theme/useTheme';

interface GroupedListProps {
  children: ReactNode;
}

// White card (radius 20, cardBorder) holding a column of `ListRow`s; the last
// row's divider is suppressed automatically.
export function GroupedList({ children }: GroupedListProps) {
  const { colors, radius } = useTheme();
  const items = Children.toArray(children);

  return (
    <View style={{ backgroundColor: colors.surface, borderRadius: radius[20], borderWidth: 1, borderColor: colors.cardBorder }}>
      {items.map((child, i) =>
        isValidElement(child) ? cloneElement(child as ReactElement<{ isLast?: boolean }>, { isLast: i === items.length - 1 }) : child,
      )}
    </View>
  );
}
