import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { CategoryCard, NavHeader, Screen } from '../../../../src/components';
import { useCategories, useTopic } from '../../../../src/content/hooks';
import { Icon } from '../../../../src/icons/Icon';
import { fontFamily } from '../../../../src/theme/typography';
import { useTheme } from '../../../../src/theme/useTheme';

export default function WordsTopic() {
  const router = useRouter();
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  const { colors, space } = useTheme();
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

      <View style={{ paddingHorizontal: space[20], paddingTop: space[12], gap: space[14] }}>
        <Pressable
          onPress={() => router.push('/(tabs)/practice')}
          accessibilityRole="button"
          accessibilityLabel="Practice flashcards for this topic"
          style={{
            backgroundColor: colors.primaryTint,
            borderWidth: 1.2,
            borderColor: colors.primary,
            borderRadius: 18,
            paddingVertical: 12,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Icon name="cards" size={20} color={colors.primaryDark} />
            <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 14, color: colors.primaryDark }}>
              Practice with Flashcards
            </Text>
          </View>
          <Icon name="arrow-right" size={16} color={colors.primaryDark} />
        </Pressable>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[10] }}>
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
      </View>
    </Screen>
  );
}
