import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { NEWS_TEMPLATE } from '../data/models'
import {
  createNews,
  getAllNews,
  getNewsById,
  updateNews,
} from '../services/storageService'
import { fileToBase64, validateImageFile } from '../utils/imageUtils'
import { translateCategory } from '../utils/i18nUtils'

function NewsFormPage({ mode }) {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditMode = mode === 'edit'
  const title = isEditMode ? t('news.form.editTitle') : t('news.form.createTitle')
  const existingNews = isEditMode ? getNewsById(id) : null

  const [formData, setFormData] = useState(() => existingNews || NEWS_TEMPLATE)
  const [imageUrlInput, setImageUrlInput] = useState(() =>
    (existingNews?.imageUrl || '').startsWith('data:') ? '' : existingNews?.imageUrl || ''
  )
  const [errors, setErrors] = useState({})
  const [operationError, setOperationError] = useState('')

  const categories = useMemo(() => {
    const newsItems = getAllNews()
    return [...new Set(newsItems.map((newsItem) => newsItem.category))]
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
        imageUrl: error.message || t('news.form.submitError'),
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
    const requiredFields = ['title', 'summary', 'content', 'publishDate', 'category']

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
        const updated = updateNews(id, formData)
        if (!updated) {
          setOperationError(t('news.form.updateMissing'))
          return
        }

        navigate(`/news/${id}`)
        return
      }

      const createdNews = createNews(formData)
      navigate(`/news/${createdNews.id}`)
    } catch (error) {
      setOperationError(error.message || t('news.form.submitError'))
    }
  }

  if (isEditMode && !existingNews) {
    return (
      <section className="page">
        <div className="card">
          <h1>{t('news.form.notFoundTitle')}</h1>
          <p>{t('news.form.notFoundText')}</p>
          <p>
            <Link className="page-link" to="/news">
              {t('news.returnToNews')}
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
            {t('news.form.title')}
            <input
              className="input"
              name="title"
              value={formData.title}
              onChange={handleChange}
            />
            {errors.title ? <span className="error-text">{errors.title}</span> : null}
          </label>

          <label className="form-field">
            {t('news.form.summary')}
            <textarea
              className="input input-textarea"
              name="summary"
              value={formData.summary}
              onChange={handleChange}
            />
            {errors.summary ? <span className="error-text">{errors.summary}</span> : null}
          </label>

          <label className="form-field">
            {t('news.form.content')}
            <textarea
              className="input input-textarea"
              name="content"
              value={formData.content}
              onChange={handleChange}
            />
            {errors.content ? <span className="error-text">{errors.content}</span> : null}
          </label>

          <div className="form-row">
            <label className="form-field">
              {t('news.form.publishDate')}
              <input
                type="date"
                className="input"
                name="publishDate"
                value={formData.publishDate}
                onChange={handleChange}
              />
              {errors.publishDate ? (
                <span className="error-text">{errors.publishDate}</span>
              ) : null}
            </label>

            <label className="form-field">
              {t('news.form.category')}
              <input
                className="input"
                name="category"
                list="news-categories"
                value={formData.category}
                onChange={handleChange}
              />
              <datalist id="news-categories">
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
          </div>

          <label className="form-field">
            {t('news.form.imageUpload')}
            <input
              type="file"
              className="input"
              accept="image/*"
              onChange={handleImageChange}
            />
            {errors.imageUrl ? <span className="error-text">{errors.imageUrl}</span> : null}
            <span className="hint-text">{t('news.form.imageHint')}</span>
          </label>

          <label className="form-field">
            {t('news.form.imageUrl')}
            <input
              type="url"
              className="input"
              placeholder={t('news.form.imageUrlPlaceholder')}
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
              {isEditMode ? t('news.form.saveEdit') : t('news.form.saveCreate')}
            </button>
            <Link className="button button-secondary" to="/news">
              {t('common.cancel')}
            </Link>
          </div>
        </form>
      </div>
    </section>
  )
}

export default NewsFormPage
