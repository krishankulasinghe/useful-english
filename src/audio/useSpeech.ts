import { useCallback, useEffect, useState } from 'react';

import { speechService, type SpeakOptions } from './SpeechService';

export function useSpeech(textToSpeak?: string) {
  const [isSpeakingThis, setIsSpeakingThis] = useState(false);
  const [globalSpeaking, setGlobalSpeaking] = useState(speechService.isSpeaking);

  useEffect(() => {
    const unsubscribe = speechService.subscribe((isSpeaking, activeText) => {
      setGlobalSpeaking(isSpeaking);
      if (textToSpeak) {
        setIsSpeakingThis(isSpeaking && activeText === textToSpeak.trim());
      } else {
        setIsSpeakingThis(isSpeaking);
      }
    });
    return unsubscribe;
  }, [textToSpeak]);

  const speak = useCallback(
    (customText?: string, options?: SpeakOptions) => {
      const text = customText ?? textToSpeak;
      if (!text) return Promise.resolve();
      return speechService.speak(text, options);
    },
    [textToSpeak],
  );

  const speakSlow = useCallback(
    (customText?: string, options?: Omit<SpeakOptions, 'rate'>) => {
      const text = customText ?? textToSpeak;
      if (!text) return Promise.resolve();
      return speechService.speakSlow(text, options);
    },
    [textToSpeak],
  );

  const stop = useCallback(() => {
    return speechService.stop();
  }, []);

  return {
    isSpeaking: textToSpeak ? isSpeakingThis : globalSpeaking,
    speak,
    speakSlow,
    stop,
  };
}
