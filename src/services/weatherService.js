const OPEN_WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather'
const WEATHER_COORDS_CACHE_KEY = 'opencity_weather_coords'
const WEATHER_COORDS_CACHE_TTL_MS = 30 * 60 * 1000

function getApiKey() {
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY

  if (!apiKey) {
    throw new Error('OpenWeather API key is missing. Check .env.local file.')
  }

  return apiKey
}

function getCachedCoordinates() {
  try {
    const raw = window.localStorage.getItem(WEATHER_COORDS_CACHE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw)
    if (!parsed?.lat || !parsed?.lon || !parsed?.savedAt) return null

    if (Date.now() - Number(parsed.savedAt) > WEATHER_COORDS_CACHE_TTL_MS) {
      return null
    }

    return {
      lat: Number(parsed.lat),
      lon: Number(parsed.lon),
    }
  } catch {
    return null
  }
}

function cacheCoordinates(lat, lon) {
  try {
    const payload = {
      lat,
      lon,
      savedAt: Date.now(),
    }

    window.localStorage.setItem(WEATHER_COORDS_CACHE_KEY, JSON.stringify(payload))
  } catch {
    // Ignore localStorage write errors to keep weather flow resilient.
  }
}

function getCurrentPositionAsync() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    })
  })
}

function normalizeWeather(data, fallbackName = 'Kyiv') {
  const weather = data.weather?.[0] || {}

  return {
    cityName: data.name || fallbackName,
    weatherId: Number(weather.id || 800),
    temperature: Math.round(data.main?.temp ?? 0),
    tempMin: Math.round(data.main?.temp_min ?? data.main?.temp ?? 0),
    tempMax: Math.round(data.main?.temp_max ?? data.main?.temp ?? 0),
    feelsLike: Math.round(data.main?.feels_like ?? data.main?.temp ?? 0),
    description: weather.description || 'No description',
    humidity: data.main?.humidity ?? 0,
    iconCode: weather.icon || '01d',
  }
}

async function fetchByQuery(query, fallbackName) {
  const apiKey = getApiKey()
  const response = await fetch(
    `${OPEN_WEATHER_BASE_URL}?${query.toString()}&appid=${apiKey}`
  )

  if (!response.ok) {
    throw new Error('Unable to fetch weather data right now.')
  }

  const data = await response.json()
  return normalizeWeather(data, fallbackName)
}

export async function fetchCurrentWeatherByCity(city = 'Kyiv') {
  const query = new URLSearchParams({
    q: city,
    units: 'metric',
  })

  return fetchByQuery(query, city)
}

export async function fetchCurrentWeatherByCoords(lat, lon) {
  const query = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    units: 'metric',
  })

  return fetchByQuery(query, 'Current location')
}

export async function detectUserCoordinates({ forceRefresh = false } = {}) {
  if (!forceRefresh) {
    const cached = getCachedCoordinates()
    if (cached) {
      return { coordinates: cached, source: 'cache', reason: null }
    }
  }

  if (!('geolocation' in navigator)) {
    return { coordinates: null, source: 'fallback', reason: 'unsupported' }
  }

  try {
    const position = await getCurrentPositionAsync()
    const coordinates = {
      lat: Number(position.coords.latitude),
      lon: Number(position.coords.longitude),
    }

    cacheCoordinates(coordinates.lat, coordinates.lon)

    return { coordinates, source: 'device', reason: null }
  } catch {
    return { coordinates: null, source: 'fallback', reason: 'denied_or_error' }
  }
}
