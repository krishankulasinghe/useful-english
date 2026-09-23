import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';

import { CategoryCard, NavHeader, Screen } from '../../../../src/components';
import { useCategories, useTopic } from '../../../../src/content/hooks';
import { useTheme } from '../../../../src/theme/useTheme';

export default function WordsTopic() {
  const router = useRouter();
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  const { space } = useTheme();
  const topic = useTopic(topicId);
  const categories = useCategories(topicId);

  return (
    <Screen scroll padded={false} contentContainerStyle={{ paddingBottom: space[32] }}>
      <NavHeader
        title={topic?.en ?? ''}
        subtitle={topic ? `${topic.si} · ${categories.length} categories` : undefined}
        backLabel="Back to topics"
        onBack={() => router.back()}
      />
      <View style={{ paddingHorizontal: space[20], paddingTop: space[12], flexDirection: 'row', flexWrap: 'wrap', gap: space[10] }}>
        {categories.map((category) => (
          <View key={category.id} style={{ width: '48%' }}>
            <CategoryCard
              letter={category.en.charAt(0).toUpperCase()}
              en={category.en}
              si={category.si}
              variant={category.order % 2 === 0 ? 'teal' : 'saffron'}
              onPress={() => router.push({ pathname: '/(tabs)/words/category/[categoryId]', params: { categoryId: category.id } })}
            />
          </View>
        ))}
      </View>
    </Screen>
  );
}
