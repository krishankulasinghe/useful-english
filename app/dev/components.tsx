import { useState } from 'react';
import { Text, View } from 'react-native';

import { BackButton } from '../../src/components/BackButton';
import { Card } from '../../src/components/Card';
import { CategoryCard } from '../../src/components/CategoryCard';
import { DarkButton } from '../../src/components/DarkButton';
import { EnglishText } from '../../src/components/EnglishText';
import { FormChip } from '../../src/components/FormChip';
import { GroupedList } from '../../src/components/GroupedList';
import { HeroCard } from '../../src/components/HeroCard';
import { IconButton } from '../../src/components/IconButton';
import { LevelChip } from '../../src/components/LevelChip';
import { ListRow } from '../../src/components/ListRow';
import { MeaningText } from '../../src/components/MeaningText';
import { NavHeader } from '../../src/components/NavHeader';
import { OutlineButton } from '../../src/components/OutlineButton';
import { PosChip } from '../../src/components/PosChip';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { ProgressBar } from '../../src/components/ProgressBar';
import { PronText } from '../../src/components/PronText';
import { RadioCard } from '../../src/components/RadioCard';
import { Screen } from '../../src/components/Screen';
import { ScreenTitle } from '../../src/components/ScreenTitle';
import { SearchField } from '../../src/components/SearchField';
import { SectionLabel } from '../../src/components/SectionLabel';
import { SegmentedControl } from '../../src/components/SegmentedControl';
import { SentenceCard } from '../../src/components/SentenceCard';
import { StatusChip } from '../../src/components/StatusChip';
import { StepDots } from '../../src/components/StepDots';
import { Switch } from '../../src/components/Switch';
import { TabBar } from '../../src/components/TabBar';
import { TopicRow } from '../../src/components/TopicRow';
import { TrioBlock } from '../../src/components/TrioBlock';
import { WordRow } from '../../src/components/WordRow';
import { useTheme } from '../../src/theme/useTheme';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { space } = useTheme();
  return (
    <View style={{ gap: space[10], marginBottom: space[28] }}>
      <Text style={{ fontWeight: '700', fontSize: 13, textTransform: 'uppercase', color: '#5B606B' }}>{title}</Text>
      {children}
    </View>
  );
}

// Visual QA for every component in src/components. Not part of the app flow.
export default function DevComponents() {
  const { space } = useTheme();
  const [search, setSearch] = useState('');
  const [switchOn, setSwitchOn] = useState(true);
  const [segment, setSegment] = useState('en');
  const [radio, setRadio] = useState('beg');
  const [goal, setGoal] = useState(10);
  const [saved, setSaved] = useState(false);

  return (
    <Screen scroll contentContainerStyle={{ paddingVertical: space[20], gap: space[28] }}>
        <Section title="ScreenTitle">
          <ScreenTitle title="Vocabulary" subtitle="වචන මාලාව" />
        </Section>

        <Section title="NavHeader">
          <NavHeader title="Nature" subtitle="සොබාදහම · 7 categories" />
        </Section>

        <Section title="BackButton / IconButton">
          <View style={{ flexDirection: 'row', gap: space[10] }}>
            <BackButton />
            <IconButton name="search" accessibilityLabel="Search" />
            <IconButton name="bookmark" accessibilityLabel="Save" filled color="#0E5A52" />
            <IconButton name="filter" accessibilityLabel="Filter" />
          </View>
        </Section>

        <Section title="Word trio / TrioBlock">
          <TrioBlock variant="hero" en="Reach" pron="රීච්" meaning="ළඟා වෙනවා" />
          <TrioBlock
            variant="example"
            en="I reached home at 8 PM."
            pron="අයි රීච්ඩ් හෝම් ඇට් එයිට් පීඑම්."
            meaning="මම රාත්‍රී 8ට ගෙදරට ළඟා වුණා."
            highlight="reached"
          />
          <TrioBlock variant="flashcard" en="Reach" pron="රීච්" />
          <EnglishText variant="wordDetail">Reach</EnglishText>
          <PronText size={30} weight={600}>
            රීච්
          </PronText>
          <MeaningText size={28} weight={600}>
            ළඟා වෙනවා
          </MeaningText>
        </Section>

        <Section title="Card / HeroCard">
          <Card>
            <EnglishText>A plain card</EnglishText>
          </Card>
          <HeroCard>
            <EnglishText>A hero card</EnglishText>
          </HeroCard>
        </Section>

        <Section title="TopicRow">
          <TopicRow
            en="Grammar Basics"
            si="ව්‍යාකරණ මූලික"
            preview="7 · Everyday English, Verbs, Nouns…"
            icon="text"
            variant="teal"
          />
          <TopicRow en="Everyday Basics" si="මූලික කතාබහ" preview="Greetings, Introductions…" icon="message-circle" variant="saffron" />
        </Section>

        <Section title="CategoryCard">
          <View style={{ flexDirection: 'row', gap: space[10] }}>
            <CategoryCard letter="A" en="Animals" si="සතුන්" variant="teal" />
            <CategoryCard letter="B" en="Birds" si="පක්ෂීන්" variant="saffron" />
          </View>
        </Section>

        <Section title="WordRow">
          <WordRow en="Reach" pron="රීච්" meaning="ළඟා වෙනවා" learned />
          <WordRow en="Arrange" pron="අරේන්ජ්" meaning="සකස් කරනවා" learned={false} />
        </Section>

        <Section title="SentenceCard">
          <SentenceCard
            en="Could you give me a minute?"
            pron="කුඩ් යූ ගිව් මී අ මිනිට්?"
            meaning="මට විනාඩියක් දෙන්න පුළුවන්ද?"
            level="beginner"
            saved={saved}
            onSave={() => setSaved((v) => !v)}
          />
        </Section>

        <Section title="Chips">
          <View style={{ flexDirection: 'row', gap: space[8], flexWrap: 'wrap' }}>
            <LevelChip level="beginner" />
            <LevelChip level="intermediate" />
            <LevelChip level="advanced" />
            <PosChip label="verb · ක්‍රියා පදය" />
            <FormChip label="reached" />
            <StatusChip />
          </View>
        </Section>

        <Section title="Switch">
          <Switch value={switchOn} onValueChange={setSwitchOn} accessibilityLabel="Example switch" />
        </Section>

        <Section title="SegmentedControl">
          <SegmentedControl
            options={[
              { value: 'en', label: 'English → සිංහල' },
              { value: 'si', label: 'සිංහල → English' },
            ]}
            value={segment}
            onChange={setSegment}
          />
        </Section>

        <Section title="RadioCard">
          <RadioCard
            variant="dot"
            selected={radio === 'beg'}
            onPress={() => setRadio('beg')}
            label="Beginner · ආරම්භක"
            description="මම ඉංග්‍රීසි වචන කිහිපයක් දන්නවා"
          />
          <RadioCard
            variant="dot"
            selected={radio === 'int'}
            onPress={() => setRadio('int')}
            label="Intermediate · මධ්‍යම"
            description="මට සරල වාක්‍ය හදන්න පුළුවන්"
          />
          <View style={{ flexDirection: 'row', gap: space[10] }}>
            {[5, 10, 20].map((n) => (
              <View key={n} style={{ flex: 1 }}>
                <RadioCard variant="tile" selected={goal === n} onPress={() => setGoal(n)} label={`${n} words a day`} tileValue={n} />
              </View>
            ))}
          </View>
        </Section>

        <Section title="StepDots">
          <StepDots total={3} activeIndex={1} />
        </Section>

        <Section title="Buttons">
          <PrimaryButton label="Learn this word" icon="arrow-right" />
          <OutlineButton label="I know it" icon="check" />
          <OutlineButton label="Still learning" tone="muted" icon={undefined} />
          <DarkButton label="Practice these words" icon="cards" />
        </Section>

        <Section title="ProgressBar">
          <ProgressBar progress={0.4} />
        </Section>

        <Section title="SearchField">
          <SearchField value={search} onChangeText={setSearch} placeholder="Search a word or category" />
        </Section>

        <Section title="SectionLabel">
          <SectionLabel>LEARNING · ඉගෙනීම</SectionLabel>
        </Section>

        <Section title="GroupedList / ListRow">
          <GroupedList>
            <ListRow label="English level" value="Beginner" onPress={() => {}} />
            <ListRow label="Daily goal" value="10 words" onPress={() => {}} />
            <ListRow
              label="Daily reminder"
              sublabel="Every day at 7:30 PM"
              right={<Switch value={switchOn} onValueChange={setSwitchOn} accessibilityLabel="Daily reminder" />}
            />
          </GroupedList>
        </Section>

        <Section title="TabBar">
          <TabBar
            items={[
              { key: 'home', icon: 'home', label: 'Home', active: true, onPress: () => {} },
              { key: 'words', icon: 'book', label: 'Words', active: false, onPress: () => {} },
              { key: 'sentences', icon: 'message', label: 'Sentences', active: false, onPress: () => {} },
              { key: 'practice', icon: 'cards', label: 'Practice', active: false, onPress: () => {} },
              { key: 'settings', icon: 'settings', label: 'Settings', active: false, onPress: () => {} },
            ]}
          />
        </Section>
    </Screen>
  );
}
