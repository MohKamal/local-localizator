import { useState, useMemo, useCallback } from "react";
import { useI18n } from "../../../providers/i18n.provider";
import { ChevronDown, Globe } from "lucide-react";

const LanguageSelector = () => {
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const { language, setLanguage } = useI18n();

  const languages = useMemo(
    () => [
      { code: "en", name: "English", flag: "🇺🇸" },
      { code: "es", name: "Español", flag: "🇪🇸" },
      { code: "fr", name: "Français", flag: "🇫🇷" },
      { code: "de", name: "Deutsch", flag: "🇩🇪" },
      { code: "ja", name: "日本語", flag: "🇯🇵" },
    ],
    []
  );

  const currentLanguage = useMemo(
    () => languages.find((lang) => lang.code === language),
    [language, languages]
  );

  const toggleMenu = useCallback(() => {
    setIsLanguageMenuOpen((prev) => !prev);
  }, []);

  const handleSelectLanguage = useCallback(
    (langCode) => {
      setLanguage(langCode);
      setIsLanguageMenuOpen(false);
    },
    [setLanguage]
  );

  return (
    <div className="relative">
      <button
        onClick={toggleMenu}
        className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
        aria-haspopup="true"
        aria-expanded={isLanguageMenuOpen}
      >
        <Globe className="w-5 h-5" aria-hidden="true" />
        <span className="hidden sm:inline text-sm font-medium">
          {currentLanguage
            ? `${currentLanguage.flag} ${currentLanguage.name}`
            : language}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${
            isLanguageMenuOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {isLanguageMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelectLanguage(lang.code)}
              className={`w-full flex items-center space-x-3 px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors duration-150 ${
                language === lang.code
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-700 hover:text-gray-900"
              }`}
              role="menuitem"
            >
              <span className="text-lg" aria-hidden="true">
                {lang.flag}
              </span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
