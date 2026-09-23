import { useSettingsStore } from '../state/settingsStore';
import { strings, type StringKey } from './strings';

export function useT(): (key: StringKey) => string {
  const appLanguage = useSettingsStore((s) => s.appLanguage);
  return (key: StringKey) => strings[appLanguage][key];
}
