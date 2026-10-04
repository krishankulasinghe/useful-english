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

export function SentenceFlipCard({
  sentence,
  categoryName,
  initialMode = 'standard',
  onFlipped,
}: SentenceFlipCardProps) {
  const { colors, space, radius, shadows } = useTheme();
  const progressRepo = useProgressRepo();
  const saved = useSaved('sentence', sentence.id);
  const [savedOverride, setSavedOverride] = useState<boolean | undefined>(undefined);

  const { isSpeaking, speak, speakSlow } = useSpeech(sentence.en);

  // Independent visibility toggles per user directive
  const [showEn, setShowEn] = useState<boolean>(initialMode !== 'recall');
  const [showMeaning, setShowMeaning] = useState<boolean>(initialMode !== 'comprehend');
  const [showPron, setShowPron] = useState<boolean>(false);

  // Reset toggles whenever sentence or mode changes
  useEffect(() => {
    setSavedOverride(undefined);
    setShowEn(initialMode !== 'recall');
    setShowMeaning(initialMode !== 'comprehend');
    setShowPron(false);
  }, [sentence.id, initialMode]);

  const isSaved = savedOverride ?? saved;

  const handleToggleSave = async () => {
    if (!progressRepo) return;
    const next = await progressRepo.toggleSaved('sentence', sentence.id);
    setSavedOverride(next);
  };

  return (
    <View style={{ width: '100%', alignItems: 'center' }}>
      <View
        style={{
          width: '100%',
          minHeight: 360,
          borderRadius: 28,
          backgroundColor: colors.surface,
          borderWidth: 1.5,
          borderColor: colors.cardBorder,
          padding: 22,
          justifyContent: 'space-between',
          ...shadows.flashcard,
        }}
      >
        {/* Top Header: Level, Category, and Save */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
            <LevelChip level={sentence.level} />
            {categoryName ? (
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 12,
                  backgroundColor: colors.neutralFill,
                  maxWidth: 180,
                }}
              >
                <Text
                  style={{ fontFamily: fontFamily.jakarta600, fontSize: 11.5, color: colors.muted }}
                  numberOfLines={1}
                >
                  {categoryName}
                </Text>
              </View>
            ) : null}
          </View>

          <Pressable
            onPress={handleToggleSave}
            accessibilityRole="button"
            accessibilityLabel={isSaved ? 'Remove from saved' : 'Save to notebook'}
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: isSaved ? colors.primaryTint : colors.neutralFill,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon
              name="bookmark"
              size={18}
              color={isSaved ? colors.primary : colors.muted}
              filled={isSaved}
            />
          </Pressable>
        </View>

        {/* Quick Visibility Controls Bar */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: colors.bg,
            borderRadius: 16,
            padding: 4,
            marginVertical: 12,
          }}
        >
          <Pressable
            onPress={() => setShowEn(!showEn)}
            accessibilityRole="button"
            accessibilityLabel={showEn ? 'Hide English sentence' : 'Show English sentence'}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              paddingVertical: 6,
              borderRadius: 12,
              backgroundColor: showEn ? colors.surface : 'transparent',
            }}
          >
            <Icon name={showEn ? 'eye' : 'eye-off'} size={14} color={showEn ? colors.primary : colors.muted} />
            <Text
              style={{
                fontFamily: fontFamily.jakarta700,
                fontSize: 12,
                color: showEn ? colors.primary : colors.muted,
              }}
            >
              English
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setShowMeaning(!showMeaning)}
            accessibilityRole="button"
            accessibilityLabel={showMeaning ? 'Hide Sinhala meaning' : 'Show Sinhala meaning'}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              paddingVertical: 6,
              borderRadius: 12,
              backgroundColor: showMeaning ? colors.surface : 'transparent',
            }}
          >
            <Icon name={showMeaning ? 'eye' : 'eye-off'} size={14} color={showMeaning ? colors.primary : colors.muted} />
            <Text
              style={{
                fontFamily: fontFamily.jakarta700,
                fontSize: 12,
                color: showMeaning ? colors.primary : colors.muted,
              }}
            >
              තේරුම
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setShowPron(!showPron)}
            accessibilityRole="button"
            accessibilityLabel={showPron ? 'Hide Sinhala pronunciation' : 'Show Sinhala pronunciation'}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              paddingVertical: 6,
              borderRadius: 12,
              backgroundColor: showPron ? colors.surface : 'transparent',
            }}
          >
            <Icon name={showPron ? 'eye' : 'eye-off'} size={14} color={showPron ? colors.saffronDark : colors.muted} />
            <Text
              style={{
                fontFamily: fontFamily.jakarta700,
                fontSize: 12,
                color: showPron ? colors.saffronDark : colors.muted,
              }}
            >
              උච්චාරණය
            </Text>
          </Pressable>
        </View>

        {/* Card Main Body */}
        <View style={{ gap: 16, marginVertical: 6 }}>
          {/* 1. English Sentence */}
          <View style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text
                style={{
                  fontFamily: fontFamily.jakarta700,
                  fontSize: 11,
                  letterSpacing: 0.8,
                  color: colors.muted,
                  textTransform: 'uppercase',
                }}
              >
                Spoken English · ඉංග්‍රීසි වාක්‍යය
              </Text>
              <Pressable
                onPress={() => setShowEn(!showEn)}
                style={{ padding: 4 }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Icon name={showEn ? 'eye' : 'eye-off'} size={14} color={colors.muted} />
              </Pressable>
            </View>

            {showEn ? (
              <Text
                style={{
                  fontFamily: fontFamily.frauncesSemiBold,
                  fontSize: 24,
                  lineHeight: 32,
                  color: colors.ink,
                }}
              >
                {sentence.en}
              </Text>
            ) : (
              <Pressable
                onPress={() => setShowEn(true)}
                style={{
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  borderRadius: 16,
                  borderWidth: 1.5,
                  borderStyle: 'dashed',
                  borderColor: colors.cardBorder,
                  backgroundColor: colors.bg,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <Icon name="eye" size={16} color={colors.primary} />
                <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 13, color: colors.primary }}>
                  Tap to check English · ඉංග්‍රීසි බලන්න
                </Text>
              </Pressable>
            )}
          </View>

          {/* 2. Sinhala Meaning */}
          <View style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text
                style={{
                  fontFamily: fontFamily.jakarta700,
                  fontSize: 11,
                  letterSpacing: 0.8,
                  color: colors.muted,
                  textTransform: 'uppercase',
                }}
              >
                සිංහල තේරුම (Meaning)
              </Text>
              <Pressable
                onPress={() => setShowMeaning(!showMeaning)}
                style={{ padding: 4 }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Icon name={showMeaning ? 'eye' : 'eye-off'} size={14} color={colors.muted} />
              </Pressable>
            </View>

            {showMeaning ? (
              <Text
                style={{
                  fontFamily: fontFamily.notoSinhala600,
                  fontSize: 20,
                  lineHeight: 30,
                  color: colors.primaryDark,
                }}
              >
                {sentence.meaningSi}
              </Text>
            ) : (
              <Pressable
                onPress={() => setShowMeaning(true)}
                style={{
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  borderRadius: 16,
                  borderWidth: 1.5,
                  borderStyle: 'dashed',
                  borderColor: colors.cardBorder,
                  backgroundColor: colors.bg,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <Icon name="eye" size={16} color={colors.primary} />
                <Text style={{ fontFamily: fontFamily.notoSinhala600, fontSize: 13, color: colors.primary }}>
                  සිංහල තේරුම බලන්න · Tap to check Meaning
                </Text>
              </Pressable>
            )}
          </View>

          {/* 3. Sinhala Phonetic Pronunciation Guide */}
          {showPron ? (
            <View
              style={{
                backgroundColor: colors.saffronTint,
                paddingVertical: 8,
                paddingHorizontal: 14,
                borderRadius: 14,
                alignSelf: 'flex-start',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Icon name="volume-2" size={14} color={colors.saffronDark} />
              <Text
                style={{
                  fontFamily: fontFamily.notoSinhala600,
                  fontSize: 15,
                  color: colors.saffronDark,
                  lineHeight: 22,
                }}
              >
                {sentence.pronunciationSi}
              </Text>
            </View>
          ) : (
            <Pressable
              onPress={() => setShowPron(true)}
              style={{
                alignSelf: 'flex-start',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingVertical: 4,
              }}
            >
              <Icon name="eye" size={13} color={colors.muted} />
              <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 12, color: colors.muted }}>
                Show pronunciation · උච්චාරණය බලන්න
              </Text>
            </Pressable>
          )}
        </View>

        {/* Audio Controls & Spoken Practice Helper */}
        <View style={{ gap: 10, marginTop: 12, borderTopWidth: 1, borderColor: colors.line, paddingTop: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable
                onPress={() => speak()}
                accessibilityRole="button"
                accessibilityLabel="Listen at regular speed"
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  borderRadius: 16,
                  backgroundColor: isSpeaking ? colors.saffron : colors.primaryTint,
                }}
              >
                <Icon name="volume-2" size={17} color={isSpeaking ? colors.white : colors.primary} />
                <Text
                  style={{
                    fontFamily: fontFamily.jakarta700,
                    fontSize: 13,
                    color: isSpeaking ? colors.white : colors.primaryDark,
                  }}
                >
                  Listen
                </Text>
              </Pressable>

              <Pressable
                onPress={() => speakSlow()}
                accessibilityRole="button"
                accessibilityLabel="Listen at slow speed"
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  borderRadius: 16,
                  backgroundColor: colors.neutralFill,
                }}
              >
                <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 12, color: colors.ink }}>
                  0.7x Slow
                </Text>
              </Pressable>
            </View>

            <Pressable
              onPress={() => {
                const allShown = showEn && showMeaning && showPron;
                setShowEn(!allShown);
                setShowMeaning(!allShown);
                setShowPron(!allShown);
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                paddingVertical: 6,
                paddingHorizontal: 8,
              }}
            >
              <Icon name="rotate-cw" size={13} color={colors.muted} />
              <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 11.5, color: colors.muted }}>
                {showEn && showMeaning ? 'Hide Details' : 'Reveal All'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
