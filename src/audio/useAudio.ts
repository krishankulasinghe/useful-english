import { useCallback } from 'react';

import { features } from '../config/features';
import { audioService, type PlaybackRate } from './AudioService';

interface AudibleItem {
  audioUrl?: string;
}

export function useAudio(item: AudibleItem | undefined) {
  const available = features.audio && !!item?.audioUrl;

  const play = useCallback(
    (rate: PlaybackRate = 1) => {
      if (!available || !item?.audioUrl) return Promise.resolve();
      return audioService.play(item.audioUrl, { rate });
    },
    [available, item?.audioUrl],
  );

  return { available, play };
}
