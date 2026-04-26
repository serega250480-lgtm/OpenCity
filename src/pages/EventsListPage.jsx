import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router-dom'
import EventCard from '../components/EventCard'
import { deleteEvent, getAllEvents } from '../services/storageService'
import { translateCategory } from '../utils/i18nUtils'

const ITEMS_PER_PAGE = 6
const ALL_CATEGORIES = '__all__'

function getDateTimeValue(eventItem) {
  const dateValue = new Date(`${eventItem.date}T${eventItem.time || '00:00'}`)
  return Number.isNaN(dateValue.getTime()) ? 0 : dateValue.getTime()
}

function EventsListPage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [events, setEvents] = useState(() => getAllEvents())
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
    const list = [...new Set(events.map((eventItem) => eventItem.category))].map(
      (category) => ({
        value: category,
        label: translateCategory(t, category),
      })
    )

    return [{ value: ALL_CATEGORIES, label: t('events.categoryAll') }, ...list]
  }, [events, t])

  const filteredEvents = useMemo(() => {
    const query = searchText.trim().toLowerCase()

    return events.filter((eventItem) => {
      const matchesSearch =
        query.length === 0 ||
        eventItem.title.toLowerCase().includes(query) ||
        eventItem.description.toLowerCase().includes(query)

      const matchesCategory =
        categoryFilter === ALL_CATEGORIES || eventItem.category === categoryFilter

      return matchesSearch && matchesCategory
    })
  }, [events, searchText, categoryFilter])

  const sortedEvents = useMemo(() => {
    const list = [...filteredEvents]

    if (sortBy === 'date_oldest') {
      return list.sort((a, b) => getDateTimeValue(a) - getDateTimeValue(b))
    }

    if (sortBy === 'title_az') {
      return list.sort((a, b) => a.title.localeCompare(b.title))
    }

    return list.sort((a, b) => getDateTimeValue(b) - getDateTimeValue(a))
  }, [filteredEvents, sortBy])

  const totalPages = Math.max(1, Math.ceil(sortedEvents.length / ITEMS_PER_PAGE))
  const activePage = Math.min(currentPage, totalPages)

  const paginatedEvents = useMemo(() => {
    const start = (activePage - 1) * ITEMS_PER_PAGE
    return sortedEvents.slice(start, start + ITEMS_PER_PAGE)
  }, [activePage, sortedEvents])

  useEffect(() => {
    if (currentPage > totalPages) {
      updatePageInUrl(totalPages, true)
    }
  }, [currentPage, totalPages])

  function handleDelete(eventId) {
    setOperationError('')
    const shouldDelete = window.confirm(
      t('events.confirmDelete')
    )
    if (!shouldDelete) return

    try {
      deleteEvent(eventId)
      setEvents(getAllEvents())
    } catch (error) {
      setOperationError(error.message || t('events.deleteError'))
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
        <h1>{t('events.listTitle')}</h1>
        <p>{t('events.listSubtitle')}</p>

        <div className="toolbar toolbar-wide">
          <input
            type="search"
            className="input"
            placeholder={t('events.searchPlaceholder')}
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

          <Link className="button button-primary" to="/events/new">
            {t('events.addEvent')}
          </Link>
        </div>
      </div>

      {operationError ? (
        <div className="card alert-error">
          <p>{operationError}</p>
        </div>
      ) : null}

      {sortedEvents.length === 0 ? (
        <div className="card">
          <p>
            {events.length === 0
              ? t('events.noEvents')
              : t('events.noMatch')}
          </p>
        </div>
      ) : (
        <>
          <div className="list-grid">
            {paginatedEvents.map((eventItem) => (
              <EventCard key={eventItem.id} event={eventItem} onDelete={handleDelete} />
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

export default EventsListPage
