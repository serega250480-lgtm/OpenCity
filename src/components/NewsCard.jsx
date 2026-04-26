import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { translateCategory } from '../utils/i18nUtils'

function NewsCard({ newsItem, onDelete }) {
  const { t } = useTranslation()

  return (
    <article className="card news-card">
      <div className="event-card__header">
        <h2 className="card-title">{newsItem.title}</h2>
        <span className="news-category-badge">{translateCategory(t, newsItem.category)}</span>
      </div>

      {newsItem.imageUrl ? (
        <img className="news-image" src={newsItem.imageUrl} alt={newsItem.title} />
      ) : null}

      <p>{newsItem.summary}</p>
      <p className="muted">
        <strong>{t('news.published')}:</strong> {newsItem.publishDate}
      </p>

      <div className="button-row">
        <Link className="button button-secondary" to={`/news/${newsItem.id}`}>
          {t('common.view')}
        </Link>
        <Link className="button button-secondary" to={`/news/${newsItem.id}/edit`}>
          {t('common.edit')}
        </Link>
        <button
          type="button"
          className="button button-danger"
          onClick={() => onDelete(newsItem.id)}
        >
          {t('common.delete')}
        </button>
      </div>
    </article>
  )
}

export default NewsCard
