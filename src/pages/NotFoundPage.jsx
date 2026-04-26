import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <section className="page">
      <div className="card">
        <h1>{t('notFound.title')}</h1>
        <p>
          {t('notFound.text')}{' '}
          <Link className="page-link" to="/">
            {t('nav.home')}
          </Link>
          .
        </p>
      </div>
    </section>
  )
}

export default NotFoundPage
