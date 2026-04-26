const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org'

function buildSearchUrl(query) {
  const params = new URLSearchParams({
    q: query,
    format: 'jsonv2',
    limit: '1',
  })

  return `${NOMINATIM_BASE_URL}/search?${params.toString()}`
}

function buildReverseUrl(lat, lon) {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    format: 'jsonv2',
    zoom: '18',
  })

  return `${NOMINATIM_BASE_URL}/reverse?${params.toString()}`
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Could not fetch geocoding data.')
  }

  return response.json()
}

export async function geocodeAddress(query) {
  const trimmedQuery = String(query || '').trim()
  if (!trimmedQuery) return null

  const data = await fetchJson(buildSearchUrl(trimmedQuery))
  const first = Array.isArray(data) ? data[0] : null
  if (!first) return null

  return {
    latitude: Number(first.lat),
    longitude: Number(first.lon),
    displayName: first.display_name || trimmedQuery,
  }
}

export async function reverseGeocodeCoordinates(latitude, longitude) {
  const data = await fetchJson(buildReverseUrl(latitude, longitude))

  if (!data?.display_name) return null

  return data.display_name
}
