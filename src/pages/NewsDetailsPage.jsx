import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteNews, getNewsById } from '../services/storageService'
import { translateCategory } from '../utils/i18nUtils'

function NewsDetailsPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const [operationError, setOperationError] = useState('')
  const newsItem = getNewsById(id)

  if (!newsItem) {
    return (
      <section className="page">
        <div className="card">
          <h1>{t('news.detailsNotFoundTitle')}</h1>
          <p>{t('news.detailsNotFoundText')}</p>
          <p>
            <Link className="page-link" to="/news">
              {t('news.returnToNews')}
            </Link>
          </p>
        </div>
      </section>
    )
  }

  function handleDelete() {
    setOperationError('')
    const shouldDelete = window.confirm(
      t('news.confirmDelete')
    )
    if (!shouldDelete) return

    try {
      deleteNews(id)
      navigate('/news')
    } catch (error) {
      setOperationError(error.message || t('news.deleteError'))
    }
  }

  return (
    <section className="page">
      <div className="card">
        <div className="event-card__header">
          <h1>{newsItem.title}</h1>
          <span className="news-category-badge">{translateCategory(t, newsItem.category)}</span>
        </div>

        {newsItem.imageUrl ? (
          <img className="news-image" src={newsItem.imageUrl} alt={newsItem.title} />
        ) : null}

        <p className="muted">
          <strong>{t('news.published')}:</strong> {newsItem.publishDate}
        </p>
        <p>{newsItem.summary}</p>
        <p>{newsItem.content}</p>

        <div className="button-row">
          <Link className="button button-secondary" to={`/news/${id}/edit`}>
            {t('common.edit')}
          </Link>
          <button type="button" className="button button-danger" onClick={handleDelete}>
            {t('news.deleteNews')}
          </button>
        </div>

        {operationError ? <p className="error-text">{operationError}</p> : null}
      </div>
    </section>
  )
}

export default NewsDetailsPage
