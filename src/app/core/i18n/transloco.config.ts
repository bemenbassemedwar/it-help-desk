import { isDevMode } from '@angular/core';
import { provideTransloco } from '@jsverse/transloco';
import { TranslocoHttpLoader } from './transloco-loader';

export function provideAppTransloco() {
  return provideTransloco({
    config: {
      availableLangs: ['en', 'ar'],
      defaultLang: 'en',
      reRenderOnLangChange: true,
      prodMode: !isDevMode(),
      fallbackLang: 'en',
      missingHandler: {
        logMissingKey: true,
        useFallbackTranslation: true,
      },
    },
    loader: TranslocoHttpLoader,
  });
}
