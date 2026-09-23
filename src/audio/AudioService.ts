export type PlaybackRate = 1 | 0.75;

export interface AudioService {
  play(url: string, opts?: { rate?: PlaybackRate }): Promise<void>;
  stop(): Promise<void>;
}

// Phase 1: audio is stubbed. Phase 2 swaps this for a real implementation
// (e.g. expo-av) behind the same interface.
export class NoopAudioService implements AudioService {
  async play(): Promise<void> {}
  async stop(): Promise<void> {}
}

export const audioService: AudioService = new NoopAudioService();
