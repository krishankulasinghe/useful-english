// Single kill switches, also used by Jest and screenshot QA.
export const features = {
  audio: true, // Native TTS enabled
  darkMode: false, // palette not designed yet
  remoteContent: true,
  ads: true,
};

export type Features = typeof features;
