import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import EventLocationMap from '../components/EventLocationMap'
import { deleteEvent, getEventById } from '../services/storageService'
import { translateCategory, translateStatus } from '../utils/i18nUtils'

function EventDetailsPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const [copyState, setCopyState] = useState('')
  const [operationError, setOperationError] = useState('')
  const eventItem = getEventById(id)

  if (!eventItem) {
    return (
      <section className="page">
        <div className="card">
          <h1>{t('events.detailsTitleMissing')}</h1>
          <p>{t('events.detailsMissingText')}</p>
          <p>
            <Link className="page-link" to="/events">
              {t('events.returnToEvents')}
            </Link>
          </p>
        </div>
      </section>
    )
  }

  async function handleCopyLink() {
    const shareLink = `${window.location.origin}/events/${id}`

    try {
      await navigator.clipboard.writeText(shareLink)
      setCopyState(t('events.linkCopied'))
    } catch {
      setCopyState(t('events.linkCopyFailed'))
    }
  }

  function handleDelete() {
    setOperationError('')
    const shouldDelete = window.confirm(
      t('events.confirmDelete')
    )
    if (!shouldDelete) return

    try {
      deleteEvent(id)
      navigate('/events')
    } catch (error) {
      setOperationError(error.message || t('events.deleteError'))
    }
  }

  const statusClass = `status-badge status-${eventItem.status.toLowerCase()}`
  const hasCoordinates =
    Number.isFinite(Number(eventItem.latitude)) &&
    Number.isFinite(Number(eventItem.longitude))

  return (
    <section className="page">
      <div className="card">
        <div className="event-card__header">
          <h1>{eventItem.title}</h1>
          <span className={statusClass}>{translateStatus(t, eventItem.status)}</span>
        </div>

        {eventItem.imageUrl ? (
          <img className="event-image" src={eventItem.imageUrl} alt={eventItem.title} />
        ) : null}

        <p>{eventItem.description}</p>

        <div className="details-grid">
          <p>
            <strong>{t('events.field.date')}:</strong> {eventItem.date}
          </p>
          <p>
            <strong>{t('events.field.time')}:</strong> {eventItem.time}
          </p>
          <p>
            <strong>{t('events.field.location')}:</strong> {eventItem.location}
          </p>
          <p>
            <strong>{t('events.field.category')}:</strong> {translateCategory(t, eventItem.category)}
          </p>
          <p>
            <strong>{t('events.field.contact')}:</strong> {eventItem.contact}
          </p>
          <p>
            <strong>{t('events.field.latitude')}:</strong>{' '}
            {hasCoordinates ? Number(eventItem.latitude).toFixed(6) : t('events.field.notSet')}
          </p>
          <p>
            <strong>{t('events.field.longitude')}:</strong>{' '}
            {hasCoordinates ? Number(eventItem.longitude).toFixed(6) : t('events.field.notSet')}
          </p>
        </div>

        {hasCoordinates ? (
          <div className="map-section">
            <h2 className="card-title">{t('events.mapTitle')}</h2>
            <EventLocationMap
              latitude={eventItem.latitude}
              longitude={eventItem.longitude}
              markerLabel={eventItem.title}
            />
          </div>
        ) : (
          <p className="hint-text">{t('events.mapMissing')}</p>
        )}

        <div className="button-row">
          <Link className="button button-secondary" to={`/events/${id}/edit`}>
            {t('common.edit')}
          </Link>
          <button type="button" className="button button-primary" onClick={handleCopyLink}>
            {t('events.copyLink')}
          </button>
          <button type="button" className="button button-danger" onClick={handleDelete}>
            {t('common.delete')}
          </button>
        </div>

        {copyState ? <p className="hint-text">{copyState}</p> : null}
        {operationError ? <p className="error-text">{operationError}</p> : null}
      </div>
    </section>
  )
}

export default EventDetailsPage
