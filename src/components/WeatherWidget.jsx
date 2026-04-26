import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  detectUserCoordinates,
  fetchCurrentWeatherByCity,
  fetchCurrentWeatherByCoords,
} from '../services/weatherService'

const DEFAULT_CITY = 'Kyiv'

function getWeatherTheme(weatherId) {
  if (weatherId >= 200 && weatherId < 300) {
    return {
      gradient:
        'from-slate-700/75 via-indigo-800/70 to-slate-900/75',
      glow: 'hover:shadow-indigo-500/20',
      icon: '⛈️',
      iconAnimation: 'animate-pulse',
    }
  }

  if (weatherId >= 300 && weatherId < 600) {
    return {
      gradient:
        'from-sky-700/70 via-blue-800/70 to-slate-800/75',
      glow: 'hover:shadow-sky-500/20',
      icon: '🌧️',
      iconAnimation: 'animate-bounce',
    }
  }

  if (weatherId >= 600 && weatherId < 700) {
    return {
      gradient:
        'from-cyan-200/75 via-sky-300/70 to-blue-400/70',
      glow: 'hover:shadow-cyan-300/30',
      icon: '❄️',
      iconAnimation: 'animate-pulse',
    }
  }

  if (weatherId >= 700 && weatherId < 800) {
    return {
      gradient:
        'from-zinc-500/70 via-slate-600/70 to-zinc-700/75',
      glow: 'hover:shadow-zinc-400/20',
      icon: '🌫️',
      iconAnimation: 'animate-pulse',
    }
  }

  if (weatherId === 800) {
    return {
      gradient:
        'from-amber-300/80 via-orange-300/75 to-yellow-400/75',
      glow: 'hover:shadow-yellow-300/30',
      icon: '☀️',
      iconAnimation: 'animate-spin [animation-duration:12s]',
    }
  }

  return {
    gradient:
      'from-sky-300/70 via-blue-400/70 to-indigo-500/70',
    glow: 'hover:shadow-blue-400/25',
    icon: '☁️',
    iconAnimation: 'animate-bounce',
  }
}

function WeatherWidget() {
  const { t } = useTranslation()
  const [weather, setWeather] = useState(null)
  const [isDetectingLocation, setIsDetectingLocation] = useState(false)
  const [isLoadingWeather, setIsLoadingWeather] = useState(false)
  const [error, setError] = useState('')
  const [infoMessage, setInfoMessage] = useState('')

  const loadWeather = useCallback(
    async (forceRefresh = false) => {
      setIsDetectingLocation(true)
      setIsLoadingWeather(true)
      setError('')
      setInfoMessage('')

      try {
        const locationResult = await detectUserCoordinates({ forceRefresh })
        setIsDetectingLocation(false)

        if (locationResult.coordinates) {
          const weatherData = await fetchCurrentWeatherByCoords(
            locationResult.coordinates.lat,
            locationResult.coordinates.lon
          )
          setWeather(weatherData)
          return
        }

        const fallbackWeather = await fetchCurrentWeatherByCity(DEFAULT_CITY)
        setWeather(fallbackWeather)

        if (locationResult.reason === 'unsupported') {
          setInfoMessage(
            t('weather.fallbackUnsupported', {
              city: DEFAULT_CITY,
              defaultValue:
                'Location is not supported by your browser. Showing weather for {{city}}.',
            })
          )
        } else {
          setInfoMessage(
            t('weather.fallbackDenied', {
              city: DEFAULT_CITY,
              defaultValue: 'Location access denied. Showing weather for {{city}}.',
            })
          )
        }
      } catch {
        setError(t('weather.loadError'))
      } finally {
        setIsDetectingLocation(false)
        setIsLoadingWeather(false)
      }
    },
    [t]
  )

  useEffect(() => {
    loadWeather()
  }, [loadWeather])

  const theme = useMemo(
    () => getWeatherTheme(weather?.weatherId ?? 800),
    [weather?.weatherId]
  )

  return (
    <article
      className={`group relative overflow-hidden rounded-3xl border border-white/35 bg-gradient-to-br ${theme.gradient} p-5 text-white shadow-2xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.01] ${theme.glow}`}
    >
      <div className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full bg-white/20 blur-3xl" />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-white/80">
            {t('weather.title')}
          </p>
          <h3 className="mt-1 text-2xl font-semibold leading-tight text-white drop-shadow-sm">
            {weather?.cityName || DEFAULT_CITY}
          </h3>
        </div>

        <button
          type="button"
          onClick={() => loadWeather(true)}
          disabled={isDetectingLocation || isLoadingWeather}
          title={t('weather.refresh', { defaultValue: 'Refresh weather' })}
          aria-label={t('weather.refresh', { defaultValue: 'Refresh weather' })}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/35 bg-white/15 text-lg text-white backdrop-blur-sm transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-60"
        >
          ↻
        </button>
      </div>

      <div className="relative z-10 mt-4">
        {isDetectingLocation ? (
          <p className="text-sm text-white/90">
            {t('weather.detectingLocation', { defaultValue: 'Detecting location...' })}
          </p>
        ) : null}

        {!isDetectingLocation && isLoadingWeather ? (
          <p className="text-sm text-white/90">{t('weather.loading')}</p>
        ) : null}

        {!isLoadingWeather && error ? (
          <p className="text-sm text-red-100">{error}</p>
        ) : null}

        {!isLoadingWeather && !error && infoMessage ? (
          <p className="text-sm text-white/85">{infoMessage}</p>
        ) : null}

        {!isLoadingWeather && !error && weather ? (
          <>
            <div className="mt-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-6xl font-semibold leading-none tracking-tight drop-shadow-sm">
                  {weather.temperature}
                  <span className="align-top text-3xl">{'\u00B0'}</span>
                </p>
                <p className="mt-2 text-sm capitalize text-white/90">
                  {weather.description}
                </p>
              </div>

              <div className="flex flex-col items-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-4 py-3 backdrop-blur-sm">
                <span className={`text-4xl ${theme.iconAnimation}`}>{theme.icon}</span>
                <span className="text-xs uppercase tracking-wide text-white/80">
                  {t('weather.condition')}
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-2xl border border-white/30 bg-white/10 p-3 backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-wide text-white/75">
                  {t('weather.high', { defaultValue: 'High' })}
                </p>
                <p className="mt-1 text-lg font-semibold">
                  {weather.tempMax}
                  {'\u00B0'}
                </p>
              </div>

              <div className="rounded-2xl border border-white/30 bg-white/10 p-3 backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-wide text-white/75">
                  {t('weather.low', { defaultValue: 'Low' })}
                </p>
                <p className="mt-1 text-lg font-semibold">
                  {weather.tempMin}
                  {'\u00B0'}
                </p>
              </div>

              <div className="rounded-2xl border border-white/30 bg-white/10 p-3 backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-wide text-white/75">
                  {t('weather.feelsLike', { defaultValue: 'Feels like' })}
                </p>
                <p className="mt-1 text-lg font-semibold">
                  {weather.feelsLike}
                  {'\u00B0'}
                </p>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </article>
  )
}

export default WeatherWidget
