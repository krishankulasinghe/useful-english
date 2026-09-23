import { useLocalSearchParams } from 'expo-router';

import { PlaceholderScreen } from '../../../../src/dev/PlaceholderScreen';

export default function WordsCategory() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  return <PlaceholderScreen name={`Word list · ${categoryId}`} />;
}
