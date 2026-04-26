import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../context/ThemeContext'
import LanguageSwitcher from './LanguageSwitcher'

function TopNav() {
  const { t } = useTranslation()
  const { isDark, toggleTheme } = useTheme()

  return (
    <header className="top-nav">
      <div className="top-nav__inner">
        <NavLink className="top-nav__brand" to="/">
          {t('nav.brand')}
        </NavLink>

        <div className="top-nav__controls">
          <nav className="top-nav__links" aria-label={t('nav.mainNavigation')}>
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `top-nav__link${isActive ? ' active' : ''}`
              }
            >
              {t('nav.home')}
            </NavLink>
            <NavLink
              to="/events"
              className={({ isActive }) =>
                `top-nav__link${isActive ? ' active' : ''}`
              }
            >
              {t('nav.events')}
            </NavLink>
            <NavLink
              to="/news"
              className={({ isActive }) =>
                `top-nav__link${isActive ? ' active' : ''}`
              }
            >
              {t('nav.news')}
            </NavLink>
            <NavLink
              to="/events/new"
              className={({ isActive }) =>
                `top-nav__link top-nav__link--cta${isActive ? ' active' : ''}`
              }
            >
              {t('nav.addEvent')}
            </NavLink>
            <NavLink
              to="/news/new"
              className={({ isActive }) =>
                `top-nav__link top-nav__link--cta${isActive ? ' active' : ''}`
              }
            >
              {t('nav.addNews')}
            </NavLink>
          </nav>

          <LanguageSwitcher />

          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={isDark ? t('theme.switchToLight') : t('theme.switchToDark')}
            title={isDark ? t('theme.light') : t('theme.dark')}
          >
            <span aria-hidden="true">{isDark ? '\u2600' : '\u263D'}</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default TopNav
