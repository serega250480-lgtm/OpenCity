/**
 * @typedef {'Active' | 'Cancelled' | 'Completed'} EventStatus
 */

/**
 * @typedef {Object} EventModel
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} date
 * @property {string} time
 * @property {string} location
 * @property {number | null} latitude
 * @property {number | null} longitude
 * @property {string} category
 * @property {EventStatus} status
 * @property {string} imageUrl
 * @property {string} contact
 */

/**
 * @typedef {Object} NewsModel
 * @property {string} id
 * @property {string} title
 * @property {string} summary
 * @property {string} content
 * @property {string} publishDate
 * @property {string} category
 * @property {string} imageUrl
 */

export const EVENT_STATUSES = ['Active', 'Cancelled', 'Completed']

export const EVENT_TEMPLATE = {
  id: '',
  title: '',
  description: '',
  date: '',
  time: '',
  location: '',
  latitude: null,
  longitude: null,
  category: '',
  status: 'Active',
  imageUrl: '',
  contact: '',
}

export const NEWS_TEMPLATE = {
  id: '',
  title: '',
  summary: '',
  content: '',
  publishDate: '',
  category: '',
  imageUrl: '',
}
