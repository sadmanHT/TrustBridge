'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

export function LanguageToggle() {
  const router = useRouter();
  const { t, i18n } = useTranslation('common');
  const [isChanging, setIsChanging] = useState(false);



  const handleLanguageChange = async (languageCode: string) => {
    if (languageCode === i18n.language || isChanging) return;
    
    setIsChanging(true);
    
    try {
      // Change the language in the URL
      const { pathname, asPath, query } = router;
      await router.push({ pathname, query }, asPath, { locale: languageCode });
    } catch (error) {
      console.error('Error changing language:', error);
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 px-0"
          disabled={isChanging}
        >
          {isChanging ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <Globe className="h-4 w-4" />
          )}
          <span className="sr-only">{t('labels.language')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[120px]">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`cursor-pointer ${
              language.code === i18n.language
                ? 'bg-accent text-accent-foreground'
                : ''
            }`}
          >
            <span className="mr-2">{language.flag}</span>
            <span>{language.name}</span>
            {language.code === i18n.language && (
              <span className="ml-auto text-xs opacity-60">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}