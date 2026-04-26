function toCategoryKey(category) {
  return String(category || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

export function translateStatus(t, status) {
  const key = String(status || '').toLowerCase()
  return t(`status.${key}`, { defaultValue: status || '' })
}

export function translateCategory(t, category) {
  const key = toCategoryKey(category)
  return t(`category.${key}`, { defaultValue: category || '' })
}
