import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router-dom'
import EventLocationPickerMap from '../components/EventLocationPickerMap'
import { EVENT_STATUSES, EVENT_TEMPLATE } from '../data/models'
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
} from '../services/storageService'
import { fileToBase64, validateImageFile } from '../utils/imageUtils'
import { translateCategory, translateStatus } from '../utils/i18nUtils'

function EventFormPage({ mode }) {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditMode = mode === 'edit'
  const title = isEditMode ? t('events.form.editTitle') : t('events.form.createTitle')
  const existingEvent = isEditMode ? getEventById(id) : null

  const [formData, setFormData] = useState(() => existingEvent || EVENT_TEMPLATE)
  const [imageUrlInput, setImageUrlInput] = useState(() =>
    (existingEvent?.imageUrl || '').startsWith('data:') ? '' : existingEvent?.imageUrl || ''
  )
  const [errors, setErrors] = useState({})
  const [operationError, setOperationError] = useState('')

  const categories = useMemo(() => {
    const events = getAllEvents()
    return [...new Set(events.map((eventItem) => eventItem.category))]
  }, [])

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  async function handleImageChange(event) {
    const selectedFile = event.target.files?.[0]
    setErrors((prev) => ({ ...prev, imageUrl: '' }))

    if (!selectedFile) return

    try {
      validateImageFile(selectedFile)
      const base64Image = await fileToBase64(selectedFile)
      setFormData((prev) => ({ ...prev, imageUrl: base64Image }))
      setImageUrlInput('')
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        imageUrl: error.message || t('events.form.submitError'),
      }))
    } finally {
      event.target.value = ''
    }
  }

  function handleImageUrlChange(event) {
    const nextUrl = event.target.value
    setImageUrlInput(nextUrl)
    setErrors((prev) => ({ ...prev, imageUrl: '' }))
    setFormData((prev) => ({ ...prev, imageUrl: nextUrl.trim() }))
  }

  function validate() {
    const nextErrors = {}
    const requiredFields = [
      'title',
      'description',
      'date',
      'time',
      'location',
      'category',
      'contact',
    ]

    requiredFields.forEach((fieldName) => {
      if (!formData[fieldName]?.trim()) {
        nextErrors[fieldName] = t('validation.required')
      }
    })

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function handleSubmit(event) {
    event.preventDefault()
    setOperationError('')
    if (!validate()) return

    try {
      if (isEditMode) {
        const updated = updateEvent(id, formData)
        if (!updated) {
          setOperationError(t('events.form.updateMissing'))
          return
        }

        navigate(`/events/${id}`)
        return
      }

      const createdEvent = createEvent(formData)
      navigate(`/events/${createdEvent.id}`)
    } catch (error) {
      setOperationError(error.message || t('events.form.submitError'))
    }
  }

  if (isEditMode && !existingEvent) {
    return (
      <section className="page">
        <div className="card">
          <h1>{t('events.form.notFoundTitle')}</h1>
          <p>{t('events.form.notFoundText')}</p>
          <p>
            <Link className="page-link" to="/events">
              {t('events.returnToEvents')}
            </Link>
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="page">
      <div className="card">
        <h1>{title}</h1>
        <form className="form-grid" onSubmit={handleSubmit} noValidate>
          <label className="form-field">
            {t('events.form.title')}
            <input
              className="input"
              name="title"
              value={formData.title}
              onChange={handleChange}
            />
            {errors.title ? <span className="error-text">{errors.title}</span> : null}
          </label>

          <label className="form-field">
            {t('events.form.description')}
            <textarea
              className="input input-textarea"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
            {errors.description ? (
              <span className="error-text">{errors.description}</span>
            ) : null}
          </label>

          <div className="form-row">
            <label className="form-field">
              {t('events.form.date')}
              <input
                type="date"
                className="input"
                name="date"
                value={formData.date}
                onChange={handleChange}
              />
              {errors.date ? <span className="error-text">{errors.date}</span> : null}
            </label>

            <label className="form-field">
              {t('events.form.time')}
              <input
                type="time"
                className="input"
                name="time"
                value={formData.time}
                onChange={handleChange}
              />
              {errors.time ? <span className="error-text">{errors.time}</span> : null}
            </label>
          </div>

          <label className="form-field">
            {t('events.form.location')}
            <input
              className="input"
              name="location"
              value={formData.location}
              onChange={handleChange}
            />
            {errors.location ? (
              <span className="error-text">{errors.location}</span>
            ) : null}
          </label>

          <div className="card map-picker-card">
            <EventLocationPickerMap
              latitude={formData.latitude}
              longitude={formData.longitude}
              locationValue={formData.location}
              onCoordinatesChange={(latitude, longitude) =>
                setFormData((prev) => ({ ...prev, latitude, longitude }))
              }
              onLocationChange={(location) =>
                setFormData((prev) => ({ ...prev, location }))
              }
              autoDetectOnMount={!isEditMode}
            />
          </div>

          <div className="form-row">
            <label className="form-field">
              {t('events.form.category')}
              <input
                className="input"
                name="category"
                list="event-categories"
                value={formData.category}
                onChange={handleChange}
              />
              <datalist id="event-categories">
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {translateCategory(t, category)}
                  </option>
                ))}
              </datalist>
              {errors.category ? (
                <span className="error-text">{errors.category}</span>
              ) : null}
            </label>

            <label className="form-field">
              {t('events.form.status')}
              <select
                className="input"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                {EVENT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {translateStatus(t, status)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="form-field">
            {t('events.form.contact')}
            <input
              className="input"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
            />
            {errors.contact ? <span className="error-text">{errors.contact}</span> : null}
          </label>

          <label className="form-field">
            {t('events.form.imageUpload')}
            <input
              type="file"
              className="input"
              accept="image/*"
              onChange={handleImageChange}
            />
            {errors.imageUrl ? <span className="error-text">{errors.imageUrl}</span> : null}
            <span className="hint-text">{t('events.form.imageHint')}</span>
          </label>

          <label className="form-field">
            {t('events.form.imageUrl')}
            <input
              type="url"
              className="input"
              placeholder={t('events.form.imageUrlPlaceholder')}
              value={imageUrlInput}
              onChange={handleImageUrlChange}
            />
          </label>

          {formData.imageUrl ? (
            <div className="image-preview">
              <p className="muted">{t('common.imagePreview')}</p>
              <img className="preview-image" src={formData.imageUrl} alt={t('common.imagePreview')} />
            </div>
          ) : null}

          {operationError ? <p className="error-text">{operationError}</p> : null}

          <div className="button-row">
            <button type="submit" className="button button-primary">
              {isEditMode ? t('events.form.saveEdit') : t('events.form.saveCreate')}
            </button>
            <Link className="button button-secondary" to="/events">
              {t('common.cancel')}
            </Link>
          </div>
        </form>
      </div>
    </section>
  )
}

export default EventFormPage
