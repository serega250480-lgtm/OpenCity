import { useTranslation } from 'react-i18next'
import { LANGUAGE_KEY } from '../i18n'

const LANGUAGES = ['en', 'ua', 'de']

function LanguageSwitcher() {
  const { t, i18n } = useTranslation()

  function handleLanguageChange(event) {
    const nextLang = event.target.value
    i18n.changeLanguage(nextLang)
    window.localStorage.setItem(LANGUAGE_KEY, nextLang)
  }

  return (
    <label className="language-switcher">
      <span>{t('lang.label')}</span>
      <select
        className="input language-switcher__select"
        value={i18n.resolvedLanguage || i18n.language}
        onChange={handleLanguageChange}
      >
        {LANGUAGES.map((lang) => (
          <option key={lang} value={lang}>
            {t(`lang.${lang}`)}
          </option>
        ))}
      </select>
    </label>
  )
}

export default LanguageSwitcher
