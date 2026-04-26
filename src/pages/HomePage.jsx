import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import WeatherWidget from '../components/WeatherWidget'
import { getAllEvents, getAllNews } from '../services/storageService'
import { translateCategory } from '../utils/i18nUtils'

function formatDate(dateValue, locale, fallback) {
  if (!dateValue) return fallback

  const parsed = new Date(dateValue)
  if (Number.isNaN(parsed.getTime())) return dateValue

  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsed)
}

function HomePage() {
  const { t, i18n } = useTranslation()
  const upcomingEvents = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return getAllEvents()
      .filter((eventItem) => eventItem.status === 'Active')
      .filter((eventItem) => {
        const eventDate = new Date(eventItem.date)
        if (Number.isNaN(eventDate.getTime())) return false
        return eventDate >= today
      })
      .sort((a, b) => {
        const aDate = new Date(`${a.date}T${a.time || '00:00'}`)
        const bDate = new Date(`${b.date}T${b.time || '00:00'}`)
        return aDate - bDate
      })
      .slice(0, 5)
  }, [])

  const latestNews = useMemo(() => {
    return [...getAllNews()]
      .sort((a, b) => b.publishDate.localeCompare(a.publishDate))
      .slice(0, 5)
  }, [])

  return (
    <section className="page dashboard-page">
      <div className="card hero-card">
        <h1>{t('home.heroTitle')}</h1>
        <p>{t('home.heroDescription')}</p>
        <div className="button-row">
          <Link className="button button-primary" to="/events">
            {t('home.exploreEvents')}
          </Link>
          <Link className="button button-secondary" to="/news">
            {t('home.readNews')}
          </Link>
        </div>
      </div>

      <div className="dashboard-grid">
        <WeatherWidget />

        <article className="card">
          <div className="event-card__header">
            <h2 className="card-title">{t('home.upcomingEvents')}</h2>
            <Link className="page-link" to="/events">
              {t('home.viewAllEvents')}
            </Link>
          </div>

          {upcomingEvents.length === 0 ? (
            <p>{t('home.noUpcomingEvents')}</p>
          ) : (
            <ul className="dashboard-list">
              {upcomingEvents.map((eventItem) => (
                <li className="dashboard-list__item" key={eventItem.id}>
                  <div className="dashboard-list__main">
                    <p className="dashboard-list__title">{eventItem.title}</p>
                    <p className="muted">
                      {formatDate(eventItem.date, i18n.language, t('common.noDate'))} {t('home.atTime')} {eventItem.time} |{' '}
                      {eventItem.location}
                    </p>
                  </div>
                  <Link className="page-link" to={`/events/${eventItem.id}`}>
                    {t('common.details')}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>

      <div className="card">
        <div className="event-card__header">
          <h2 className="card-title">{t('home.latestNews')}</h2>
          <Link className="page-link" to="/news">
            {t('home.viewAllNews')}
          </Link>
        </div>

        {latestNews.length === 0 ? (
          <p>{t('home.noNews')}</p>
        ) : (
          <ul className="dashboard-list">
            {latestNews.map((newsItem) => (
              <li className="dashboard-list__item" key={newsItem.id}>
                <div className="dashboard-list__main">
                  <p className="dashboard-list__title">{newsItem.title}</p>
                  <p className="muted">
                    {formatDate(newsItem.publishDate, i18n.language, t('common.noDate'))} | {translateCategory(t, newsItem.category)}
                  </p>
                </div>
                <Link className="page-link" to={`/news/${newsItem.id}`}>
                  {t('common.read')}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

export default HomePage
