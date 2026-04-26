import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router-dom'
import NewsCard from '../components/NewsCard'
import { deleteNews, getAllNews } from '../services/storageService'
import { translateCategory } from '../utils/i18nUtils'

const ITEMS_PER_PAGE = 6
const ALL_CATEGORIES = '__all__'

function getPublishDateValue(newsItem) {
  const dateValue = new Date(newsItem.publishDate)
  return Number.isNaN(dateValue.getTime()) ? 0 : dateValue.getTime()
}

function NewsListPage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [news, setNews] = useState(() => getAllNews())
  const [searchText, setSearchText] = useState('')
  const [categoryFilter, setCategoryFilter] = useState(ALL_CATEGORIES)
  const [sortBy, setSortBy] = useState('date_newest')
  const [operationError, setOperationError] = useState('')

  const currentPage = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1)

  function updatePageInUrl(nextPage, replace = false) {
    const pageNumber = Math.max(1, nextPage)
    const nextParams = new URLSearchParams(searchParams)

    if (pageNumber === 1) {
      nextParams.delete('page')
    } else {
      nextParams.set('page', String(pageNumber))
    }

    setSearchParams(nextParams, { replace })
  }

  const categories = useMemo(() => {
    const list = [...new Set(news.map((newsItem) => newsItem.category))].map(
      (category) => ({
        value: category,
        label: translateCategory(t, category),
      })
    )

    return [{ value: ALL_CATEGORIES, label: t('news.categoryAll') }, ...list]
  }, [news, t])

  const filteredNews = useMemo(() => {
    const query = searchText.trim().toLowerCase()

    return news.filter((newsItem) => {
      const matchesSearch =
        query.length === 0 ||
        newsItem.title.toLowerCase().includes(query) ||
        newsItem.summary.toLowerCase().includes(query)

      const matchesCategory =
        categoryFilter === ALL_CATEGORIES || newsItem.category === categoryFilter

      return matchesSearch && matchesCategory
    })
  }, [news, searchText, categoryFilter])

  const sortedNews = useMemo(() => {
    const list = [...filteredNews]

    if (sortBy === 'date_oldest') {
      return list.sort((a, b) => getPublishDateValue(a) - getPublishDateValue(b))
    }

    if (sortBy === 'title_az') {
      return list.sort((a, b) => a.title.localeCompare(b.title))
    }

    return list.sort((a, b) => getPublishDateValue(b) - getPublishDateValue(a))
  }, [filteredNews, sortBy])

  const totalPages = Math.max(1, Math.ceil(sortedNews.length / ITEMS_PER_PAGE))
  const activePage = Math.min(currentPage, totalPages)

  const paginatedNews = useMemo(() => {
    const start = (activePage - 1) * ITEMS_PER_PAGE
    return sortedNews.slice(start, start + ITEMS_PER_PAGE)
  }, [activePage, sortedNews])

  useEffect(() => {
    if (currentPage > totalPages) {
      updatePageInUrl(totalPages, true)
    }
  }, [currentPage, totalPages])

  function handleDelete(newsId) {
    setOperationError('')
    const shouldDelete = window.confirm(
      t('news.confirmDelete')
    )
    if (!shouldDelete) return

    try {
      deleteNews(newsId)
      setNews(getAllNews())
    } catch (error) {
      setOperationError(error.message || t('news.deleteError'))
    }
  }

  function handleSearchChange(event) {
    setSearchText(event.target.value)
    updatePageInUrl(1, true)
  }

  function handleCategoryChange(event) {
    setCategoryFilter(event.target.value)
    updatePageInUrl(1, true)
  }

  function handleSortChange(event) {
    setSortBy(event.target.value)
    updatePageInUrl(1, true)
  }

  return (
    <section className="page">
      <div className="card">
        <h1>{t('news.listTitle')}</h1>
        <p>{t('news.listSubtitle')}</p>

        <div className="toolbar toolbar-wide">
          <input
            type="search"
            className="input"
            placeholder={t('news.searchPlaceholder')}
            value={searchText}
            onChange={handleSearchChange}
          />

          <select
            className="input"
            value={categoryFilter}
            onChange={handleCategoryChange}
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>

          <select className="input" value={sortBy} onChange={handleSortChange}>
            <option value="date_newest">{t('sort.dateNewest')}</option>
            <option value="date_oldest">{t('sort.dateOldest')}</option>
            <option value="title_az">{t('sort.titleAZ')}</option>
          </select>

          <Link className="button button-primary" to="/news/new">
            {t('news.addNews')}
          </Link>
        </div>
      </div>

      {operationError ? (
        <div className="card alert-error">
          <p>{operationError}</p>
        </div>
      ) : null}

      {sortedNews.length === 0 ? (
        <div className="card">
          <p>
            {news.length === 0
              ? t('news.noNews')
              : t('news.noMatch')}
          </p>
        </div>
      ) : (
        <>
          <div className="list-grid">
            {paginatedNews.map((newsItem) => (
              <NewsCard key={newsItem.id} newsItem={newsItem} onDelete={handleDelete} />
            ))}
          </div>

          <div className="pagination-controls">
            <button
              type="button"
              className="button button-secondary"
              disabled={activePage <= 1}
              onClick={() => updatePageInUrl(activePage - 1)}
            >
              {t('common.previous')}
            </button>
            <p className="pagination-label">
              {t('common.pageOf', { page: activePage, total: totalPages })}
            </p>
            <button
              type="button"
              className="button button-secondary"
              disabled={activePage >= totalPages}
              onClick={() => updatePageInUrl(activePage + 1)}
            >
              {t('common.next')}
            </button>
          </div>
        </>
      )}
    </section>
  )
}

export default NewsListPage
