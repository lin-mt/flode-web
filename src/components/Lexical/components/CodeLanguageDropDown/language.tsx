import { CODE_LANGUAGE_FRIENDLY_NAME_MAP } from "@lexical/code";

export function getCodeLanguageOptions(): [string, string][] {
  const options: [string, string][] = [];

  for (const [lang, friendlyName] of Object.entries(
    CODE_LANGUAGE_FRIENDLY_NAME_MAP
  )) {
    options.push([lang, friendlyName]);
  }

  return options;
}

export const CODE_LANGUAGE_OPTIONS = getCodeLanguageOptions();
