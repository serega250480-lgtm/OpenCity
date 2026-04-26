import { EVENT_TEMPLATE, NEWS_TEMPLATE } from '../data/models'
import { SAMPLE_EVENTS, SAMPLE_NEWS } from '../data/mockData'

const STORAGE_KEYS = {
  events: 'opencity_events',
  news: 'opencity_news',
}

function createId(prefix) {
  if (window.crypto && window.crypto.randomUUID) {
    return `${prefix}-${window.crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`
}

function readCollection(key, fallback = []) {
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return fallback

    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

function writeCollection(key, collection) {
  try {
    window.localStorage.setItem(key, JSON.stringify(collection))
  } catch {
    throw new Error('Could not save data to localStorage.')
  }
}

export function seedInitialDataIfEmpty() {
  try {
    const eventsRaw = window.localStorage.getItem(STORAGE_KEYS.events)
    const newsRaw = window.localStorage.getItem(STORAGE_KEYS.news)

    if (eventsRaw === null) {
      writeCollection(STORAGE_KEYS.events, SAMPLE_EVENTS)
    }

    if (newsRaw === null) {
      writeCollection(STORAGE_KEYS.news, SAMPLE_NEWS)
    }
  } catch {
    // Keep app running even if browser storage is unavailable.
  }
}

function ensureSeeded() {
  seedInitialDataIfEmpty()
}

export function getAllEvents() {
  ensureSeeded()
  return readCollection(STORAGE_KEYS.events)
}

export function getEventById(id) {
  ensureSeeded()
  return getAllEvents().find((eventItem) => eventItem.id === id) || null
}

export function createEvent(eventData) {
  ensureSeeded()
  const events = getAllEvents()

  const newEvent = {
    ...EVENT_TEMPLATE,
    ...eventData,
    id: createId('evt'),
  }

  const updatedEvents = [newEvent, ...events]
  writeCollection(STORAGE_KEYS.events, updatedEvents)

  return newEvent
}

export function updateEvent(id, updatedFields) {
  ensureSeeded()
  const events = getAllEvents()
  const targetIndex = events.findIndex((eventItem) => eventItem.id === id)

  if (targetIndex === -1) return null

  const updatedEvent = {
    ...events[targetIndex],
    ...updatedFields,
    id,
  }

  const updatedEvents = [...events]
  updatedEvents[targetIndex] = updatedEvent
  writeCollection(STORAGE_KEYS.events, updatedEvents)

  return updatedEvent
}

export function deleteEvent(id) {
  ensureSeeded()
  const events = getAllEvents()
  const updatedEvents = events.filter((eventItem) => eventItem.id !== id)
  const changed = updatedEvents.length !== events.length

  if (changed) {
    writeCollection(STORAGE_KEYS.events, updatedEvents)
  }

  return changed
}

export function getAllNews() {
  ensureSeeded()
  return readCollection(STORAGE_KEYS.news)
}

export function getNewsById(id) {
  ensureSeeded()
  return getAllNews().find((newsItem) => newsItem.id === id) || null
}

export function createNews(newsData) {
  ensureSeeded()
  const news = getAllNews()

  const newNews = {
    ...NEWS_TEMPLATE,
    ...newsData,
    id: createId('news'),
  }

  const updatedNews = [newNews, ...news]
  writeCollection(STORAGE_KEYS.news, updatedNews)

  return newNews
}

export function updateNews(id, updatedFields) {
  ensureSeeded()
  const news = getAllNews()
  const targetIndex = news.findIndex((newsItem) => newsItem.id === id)

  if (targetIndex === -1) return null

  const updatedNewsItem = {
    ...news[targetIndex],
    ...updatedFields,
    id,
  }

  const updatedNews = [...news]
  updatedNews[targetIndex] = updatedNewsItem
  writeCollection(STORAGE_KEYS.news, updatedNews)

  return updatedNewsItem
}

export function deleteNews(id) {
  ensureSeeded()
  const news = getAllNews()
  const updatedNews = news.filter((newsItem) => newsItem.id !== id)
  const changed = updatedNews.length !== news.length

  if (changed) {
    writeCollection(STORAGE_KEYS.news, updatedNews)
  }

  return changed
}
