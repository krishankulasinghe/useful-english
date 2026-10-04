import * as Speech from 'expo-speech';

export interface SpeakOptions {
  rate?: number; // default 0.88 for clear ESL comprehension
  pitch?: number;
  language?: string;
  onDone?: () => void;
  onStart?: () => void;
  onError?: (error: Error) => void;
  onStopped?: () => void;
}

export class SpeechService {
  private activeText: string | null = null;
  private isSpeakingState = false;
  private listeners = new Set<(isSpeaking: boolean, activeText: string | null) => void>();

  constructor() {}

  subscribe(listener: (isSpeaking: boolean, activeText: string | null) => void): () => void {
    this.listeners.add(listener);
    listener(this.isSpeakingState, this.activeText);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(isSpeaking: boolean, activeText: string | null) {
    this.isSpeakingState = isSpeaking;
    this.activeText = activeText;
    this.listeners.forEach((l) => l(isSpeaking, activeText));
  }

  async speak(text: string, options?: SpeakOptions): Promise<void> {
    const trimmed = text.trim();
    if (!trimmed) return;

    // If already speaking the same text, stop it (toggle behaviour)
    if (this.isSpeakingState && this.activeText === trimmed) {
      await this.stop();
      return;
    }

    // Stop any ongoing speech
    try {
      await Speech.stop();
    } catch {
      // ignore
    }

    this.notify(true, trimmed);
    options?.onStart?.();

    const rate = options?.rate ?? 0.88;
    const pitch = options?.pitch ?? 1.0;
    const language = options?.language ?? 'en-US';

    try {
      Speech.speak(trimmed, {
        language,
        pitch,
        rate,
        onDone: () => {
          this.notify(false, null);
          options?.onDone?.();
        },
        onStopped: () => {
          this.notify(false, null);
          options?.onStopped?.();
        },
        onError: (err) => {
          this.notify(false, null);
          options?.onError?.(err instanceof Error ? err : new Error(String(err)));
        },
      });
    } catch (e) {
      this.notify(false, null);
      options?.onError?.(e instanceof Error ? e : new Error(String(e)));
    }
  }

  async speakSlow(text: string, options?: Omit<SpeakOptions, 'rate'>): Promise<void> {
    return this.speak(text, { ...options, rate: 0.72 });
  }

  async stop(): Promise<void> {
    try {
      await Speech.stop();
    } finally {
      this.notify(false, null);
    }
  }

  get isSpeaking(): boolean {
    return this.isSpeakingState;
  }

  get currentText(): string | null {
    return this.activeText;
  }
}

export const speechService = new SpeechService();
