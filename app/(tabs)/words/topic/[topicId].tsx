import { useLocalSearchParams } from 'expo-router';

import { PlaceholderScreen } from '../../../../src/dev/PlaceholderScreen';

export default function WordsTopic() {
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  return <PlaceholderScreen name={`Words topic · ${topicId}`} />;
}
