import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useSpeech } from '../audio/useSpeech';
import type { SentenceItem } from '../content/types';
import { Icon } from '../icons/Icon';
import { useProgressRepo, useSaved } from '../state/hooks';
import { fontFamily } from '../theme/typography';
import { useTheme } from '../theme/useTheme';
import { LevelChip } from './LevelChip';

export type PracticeMode = 'recall' | 'comprehend' | 'standard';

interface SentenceFlipCardProps {
  sentence: SentenceItem;
  categoryName?: string;
  initialMode?: PracticeMode;
  onFlipped?: (isFlipped: boolean) => void;
}

interface LayerProps {
  label: string;
  shown: boolean;
  onToggle: () => void;
  revealLabel: string;
  revealFont: string;
  children: React.ReactNode;
}

// One reveal layer: overline + eye toggle, then the content or a dashed "tap to check" button.
function Layer({ label, shown, onToggle, revealLabel, revealFont, children }: LayerProps) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 11, letterSpacing: 0.88, color: colors.muted }}>{label}</Text>
        <Pressable
          onPress={onToggle}
          accessibilityRole="button"
          accessibilityLabel={shown ? 'Hide' : 'Show'}
          style={{ width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}
          hitSlop={6}
        >
          <Icon name={shown ? 'eye' : 'eye-off'} size={16} color={colors.muted} />
        </Pressable>
      </View>
      {shown ? (
        children
      ) : (
        <Pressable
          onPress={onToggle}
          accessibilityRole="button"
          style={{
            height: 52,
            borderRadius: 16,
            borderWidth: 1.5,
            borderStyle: 'dashed',
            borderColor: colors.dashed,
            backgroundColor: colors.bg,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Icon name="eye" size={16} color={colors.primary} />
          <Text style={{ fontFamily: revealFont, fontSize: 14, color: colors.primary }}>{revealLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

export function SentenceFlipCard({
  sentence,
  categoryName,
  initialMode = 'standard',
  onFlipped,
}: SentenceFlipCardProps) {
  const { colors, shadows } = useTheme();
  const progressRepo = useProgressRepo();
  const saved = useSaved('sentence', sentence.id);
  const [savedOverride, setSavedOverride] = useState<boolean | undefined>(undefined);

  const { isSpeaking, speak, speakSlow } = useSpeech(sentence.en);

  // Independent visibility toggles per layer
  const [showEn, setShowEn] = useState<boolean>(initialMode !== 'recall');
  const [showMeaning, setShowMeaning] = useState<boolean>(initialMode !== 'comprehend');
  const [showPron, setShowPron] = useState<boolean>(false);
  const [slowPlayed, setSlowPlayed] = useState(false);

  // Reset toggles whenever sentence or mode changes
  useEffect(() => {
    setSavedOverride(undefined);
    setShowEn(initialMode !== 'recall');
    setShowMeaning(initialMode !== 'comprehend');
    setShowPron(false);
    setSlowPlayed(false);
  }, [sentence.id, initialMode]);

  useEffect(() => {
    onFlipped?.(showEn && showMeaning && showPron);
  }, [showEn, showMeaning, showPron, onFlipped]);

  const isSaved = savedOverride ?? saved;
  const allShown = showEn && showMeaning && showPron;

  const handleToggleSave = async () => {
    if (!progressRepo) return;
    const next = await progressRepo.toggleSaved('sentence', sentence.id);
    setSavedOverride(next);
  };

  const handleSlow = () => {
    setSlowPlayed(true);
    speakSlow();
  };

  return (
    <View
      style={[
        { width: '100%', backgroundColor: colors.surface, borderRadius: 28, padding: 20, gap: 20 },
        shadows.e2,
      ]}
    >
      {/* Chips + save */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <LevelChip level={sentence.level} />
        {categoryName ? (
          <View style={{ height: 24, paddingHorizontal: 8, borderRadius: 6, backgroundColor: colors.neutralFill, justifyContent: 'center', flexShrink: 1 }}>
            <Text numberOfLines={1} style={{ fontFamily: fontFamily.jakarta600, fontSize: 12, color: colors.ink2 }}>
              {categoryName}
            </Text>
          </View>
        ) : null}
        <View style={{ flex: 1 }} />
        <Pressable
          onPress={handleToggleSave}
          accessibilityRole="button"
          accessibilityLabel={isSaved ? 'Remove from saved' : 'Save to notebook'}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: isSaved ? colors.ink : colors.neutralFill,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="bookmark" size={18} color={isSaved ? colors.white : colors.ink} filled={isSaved} />
        </Pressable>
      </View>

      <Layer
        label="SPOKEN ENGLISH"
        shown={showEn}
        onToggle={() => setShowEn((v) => !v)}
        revealLabel="Tap to check English"
        revealFont={fontFamily.jakarta600}
      >
        <Text style={{ fontFamily: fontFamily.frauncesSemiBold, fontSize: 24, lineHeight: 31, letterSpacing: -0.24, color: colors.ink }}>
          {sentence.en}
        </Text>
      </Layer>

      <Layer
        label="MEANING · තේරුම"
        shown={showMeaning}
        onToggle={() => setShowMeaning((v) => !v)}
        revealLabel="තේරුම බලන්න"
        revealFont={fontFamily.notoSinhala600}
      >
        <Text style={{ fontFamily: fontFamily.notoSinhala600, fontSize: 19, lineHeight: 30.4, color: colors.primary }}>{sentence.meaningSi}</Text>
      </Layer>

      <Layer
        label="PRONUNCIATION · උච්චාරණය"
        shown={showPron}
        onToggle={() => setShowPron((v) => !v)}
        revealLabel="උච්චාරණය බලන්න"
        revealFont={fontFamily.notoSinhala600}
      >
        <View style={{ backgroundColor: colors.saffronTint, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 14 }}>
          <Text style={{ fontFamily: fontFamily.notoSinhala500, fontSize: 16, lineHeight: 25.6, color: colors.saffronDark }}>
            {sentence.pronunciationSi}
          </Text>
        </View>
      </Layer>

      {/* Listen / slow / reveal all */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, borderTopWidth: 1, borderTopColor: colors.cardBorder, paddingTop: 16 }}>
        <Pressable
          onPress={() => speak()}
          accessibilityRole="button"
          accessibilityLabel="Listen at regular speed"
          style={{
            height: 44,
            paddingHorizontal: 16,
            borderRadius: 22,
            backgroundColor: isSpeaking ? colors.primary : colors.primaryTint,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Icon name="volume-2" size={18} color={isSpeaking ? colors.white : colors.primaryDark} />
          <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 14, color: isSpeaking ? colors.white : colors.primaryDark }}>Listen</Text>
        </Pressable>

        <Pressable
          onPress={handleSlow}
          accessibilityRole="button"
          accessibilityLabel="Listen at slow speed"
          style={{
            height: 44,
            paddingHorizontal: 14,
            borderRadius: 22,
            backgroundColor: slowPlayed && isSpeaking ? colors.ink : colors.neutralFill,
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 14, color: slowPlayed && isSpeaking ? colors.white : colors.ink }}>0.7× slow</Text>
        </Pressable>

        <View style={{ flex: 1 }} />

        <Pressable
          onPress={() => {
            setShowEn(!allShown);
            setShowMeaning(!allShown);
            setShowPron(!allShown);
          }}
          accessibilityRole="button"
          style={{ height: 44, paddingHorizontal: 4, flexDirection: 'row', alignItems: 'center', gap: 4 }}
        >
          <Icon name="rotate-cw" size={14} color={colors.muted} />
          <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 13, color: colors.muted }}>{allShown ? 'Hide all' : 'Reveal all'}</Text>
        </Pressable>
      </View>
    </View>
  );
}
