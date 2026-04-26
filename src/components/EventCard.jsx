import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { translateCategory, translateStatus } from '../utils/i18nUtils'

function EventCard({ event, onDelete }) {
  const { t } = useTranslation()
  const statusClass = `status-badge status-${event.status.toLowerCase()}`

  return (
    <article className="card event-card">
      <div className="event-card__header">
        <h2 className="card-title">{event.title}</h2>
        <span className={statusClass}>{translateStatus(t, event.status)}</span>
      </div>

      <div className="event-meta">
        <p>
          <strong>{t('events.field.date')}:</strong> {event.date}
        </p>
        <p>
          <strong>{t('events.field.time')}:</strong> {event.time}
        </p>
        <p>
          <strong>{t('events.field.location')}:</strong> {event.location}
        </p>
        <p>
          <strong>{t('events.field.category')}:</strong> {translateCategory(t, event.category)}
        </p>
      </div>

      <div className="button-row">
        <Link className="button button-secondary" to={`/events/${event.id}`}>
          {t('common.view')}
        </Link>
        <Link className="button button-secondary" to={`/events/${event.id}/edit`}>
          {t('common.edit')}
        </Link>
        <button
          type="button"
          className="button button-danger"
          onClick={() => onDelete(event.id)}
        >
          {t('common.delete')}
        </button>
      </div>
    </article>
  )
}

export default EventCard
