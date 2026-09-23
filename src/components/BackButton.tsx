import { IconButton } from './IconButton';

interface BackButtonProps {
  onPress?: () => void;
  label?: string; // e.g. "Back to Verbs"
}

// 44px round back chevron, white bg + 1px line border (NavHeader left slot).
export function BackButton({ onPress, label = 'Back' }: BackButtonProps) {
  return <IconButton name="chevron-left" onPress={onPress} accessibilityLabel={label} iconSize={22} strokeWidth={1.9} />;
}
