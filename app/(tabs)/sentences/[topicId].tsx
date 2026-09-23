import { useLocalSearchParams } from 'expo-router';

import { PlaceholderScreen } from '../../../src/dev/PlaceholderScreen';

export default function SentenceList() {
  const { topicId, categoryId } = useLocalSearchParams<{ topicId: string; categoryId?: string }>();
  return <PlaceholderScreen name={`Sentence list · ${topicId}${categoryId ? ` · ${categoryId}` : ''}`} />;
}
