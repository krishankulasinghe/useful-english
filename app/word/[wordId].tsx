import { useLocalSearchParams } from 'expo-router';

import { PlaceholderScreen } from '../../src/dev/PlaceholderScreen';

export default function WordDetail() {
  const { wordId, categoryId } = useLocalSearchParams<{ wordId: string; categoryId?: string }>();
  return <PlaceholderScreen name={`Word detail · ${wordId}${categoryId ? ` (${categoryId})` : ''}`} />;
}
