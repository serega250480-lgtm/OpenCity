import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import {
  geocodeAddress,
  reverseGeocodeCoordinates,
} from '../services/geocodingService'

const KYIV_CENTER = [50.4501, 30.5234]
const DEFAULT_ZOOM = 13

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(event) {
      onMapClick(event.latlng.lat, event.latlng.lng)
    },
  })

  return null
}

function RecenterMap({ latitude, longitude }) {
  const map = useMap()

  useEffect(() => {
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return
    map.setView([latitude, longitude], map.getZoom())
  }, [latitude, longitude, map])

  return null
}

function EventLocationPickerMap({
  latitude,
  longitude,
  locationValue,
  onCoordinatesChange,
  onLocationChange,
  autoDetectOnMount,
}) {
  const { t } = useTranslation()
  const [isDetecting, setIsDetecting] = useState(false)
  const [isResolvingAddress, setIsResolvingAddress] = useState(false)
  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false)
  const [mapMessage, setMapMessage] = useState('')

  const skipNextForwardGeocodeRef = useRef(false)
  const hasAutoDetectedRef = useRef(false)

  const hasCoordinates =
    Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude))

  const markerLat = hasCoordinates ? Number(latitude) : null
  const markerLng = hasCoordinates ? Number(longitude) : null
  const mapCenter = hasCoordinates ? [markerLat, markerLng] : KYIV_CENTER

  const resolveAddress = useCallback(
    async (lat, lng) => {
      setIsResolvingAddress(true)
      setMapMessage('')

      try {
        const address = await reverseGeocodeCoordinates(lat, lng)
        if (address) {
          skipNextForwardGeocodeRef.current = true
          onLocationChange(address)
        }
      } catch {
        setMapMessage(
          t('events.form.addressResolveError', {
            defaultValue: 'Could not resolve address for this location.',
          })
        )
      } finally {
        setIsResolvingAddress(false)
      }
    },
    [onLocationChange, t]
  )

  const applyCoordinates = useCallback(
    (lat, lng, shouldResolveAddress = true) => {
      const normalizedLat = Number(lat.toFixed(6))
      const normalizedLng = Number(lng.toFixed(6))

      onCoordinatesChange(normalizedLat, normalizedLng)

      if (shouldResolveAddress) {
        resolveAddress(normalizedLat, normalizedLng)
      }
    },
    [onCoordinatesChange, resolveAddress]
  )

  const detectUserLocation = useCallback(async () => {
    if (!('geolocation' in navigator)) {
      setMapMessage(
        t('events.form.geoUnsupported', {
          defaultValue: 'Geolocation is not supported by this browser.',
        })
      )
      return
    }

    setIsDetecting(true)
    setMapMessage('')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude)
        const lng = Number(position.coords.longitude)
        applyCoordinates(lat, lng, true)
        setIsDetecting(false)
      },
      () => {
        setIsDetecting(false)
        setMapMessage(
          t('events.form.geoDetectError', {
            defaultValue:
              'Could not detect your location. You can still click on the map.',
          })
        )
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }, [applyCoordinates, t])

  useEffect(() => {
    if (!autoDetectOnMount) return
    if (hasAutoDetectedRef.current) return
    if (hasCoordinates) return

    hasAutoDetectedRef.current = true
    detectUserLocation()
  }, [autoDetectOnMount, detectUserLocation, hasCoordinates])

  useEffect(() => {
    const query = String(locationValue || '').trim()
    if (!query || query.length < 4) return

    if (skipNextForwardGeocodeRef.current) {
      skipNextForwardGeocodeRef.current = false
      return
    }

    const timeoutId = window.setTimeout(async () => {
      setIsGeocodingAddress(true)
      setMapMessage('')

      try {
        const result = await geocodeAddress(query)
        if (!result) {
          setMapMessage(
            t('events.form.addressNotFound', {
              defaultValue: 'Address not found. Please adjust the text or pick on map.',
            })
          )
          return
        }

        onCoordinatesChange(
          Number(result.latitude.toFixed(6)),
          Number(result.longitude.toFixed(6))
        )
      } catch {
        setMapMessage(
          t('events.form.addressGeocodeError', {
            defaultValue: 'Could not geocode this address right now.',
          })
        )
      } finally {
        setIsGeocodingAddress(false)
      }
    }, 700)

    return () => window.clearTimeout(timeoutId)
  }, [locationValue, onCoordinatesChange, t])

  const statusMessage = isDetecting
    ? t('events.form.detectingLocation', { defaultValue: 'Detecting location...' })
    : isResolvingAddress
      ? t('events.form.resolvingAddress', { defaultValue: 'Resolving address...' })
      : isGeocodingAddress
        ? t('events.form.geocodingAddress', { defaultValue: 'Finding coordinates from address...' })
        : mapMessage

  return (
    <div className="map-picker-panel">
      <div className="event-card__header">
        <h2 className="card-title">
          {t('events.form.coordinates', { defaultValue: 'Coordinates' })}
        </h2>
        <button
          type="button"
          className="button button-secondary"
          onClick={detectUserLocation}
          disabled={isDetecting}
        >
          {t('events.form.myLocation', { defaultValue: 'My Location' })}
        </button>
      </div>

      <p className="muted">
        {hasCoordinates
          ? `Lat: ${markerLat.toFixed(6)} | Lng: ${markerLng.toFixed(6)}`
          : t('events.form.coordsMissing')}
      </p>

      {statusMessage ? <p className="hint-text">{statusMessage}</p> : null}

      <div className="event-map">
        <MapContainer center={mapCenter} zoom={hasCoordinates ? 14 : DEFAULT_ZOOM} scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <RecenterMap latitude={markerLat} longitude={markerLng} />

          {hasCoordinates ? (
            <Marker position={[markerLat, markerLng]}>
              <Popup>{t('events.form.selectedLocation')}</Popup>
            </Marker>
          ) : null}

          <MapClickHandler onMapClick={(lat, lng) => applyCoordinates(lat, lng, true)} />
        </MapContainer>
      </div>
    </div>
  )
}

export default EventLocationPickerMap
