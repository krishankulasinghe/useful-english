import { useAudio } from '../audio/useAudio';

interface ListenSlotProps {
  audioUrl?: string;
  variant?: 'word' | 'example';
}

// Phase 2 hook: renders nothing while `features.audio` is off (Phase 1).
// Kept in the tree so Word Detail's layout doesn't need to change when
// audio ships — see design/screens/DetailAudio.dc.html.
export function ListenSlot({ audioUrl }: ListenSlotProps) {
  const { available } = useAudio(audioUrl ? { audioUrl } : undefined);
  if (!available) return null;
  // Phase 2 fills in the play button / "Listen" pill here.
  return null;
}
