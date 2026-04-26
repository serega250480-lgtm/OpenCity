import 'leaflet/dist/leaflet.css'
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet'

const KYIV_CENTER = [50.4501, 30.5234]

function ClickHandler({ onPick }) {
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng)
    },
  })

  return null
}

function EventLocationMap({ latitude, longitude, onPick, markerLabel = 'Event location' }) {
  const hasCoordinates =
    Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude))

  const center = hasCoordinates
    ? [Number(latitude), Number(longitude)]
    : KYIV_CENTER

  return (
    <div className="event-map">
      <MapContainer center={center} zoom={hasCoordinates ? 14 : 11} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {hasCoordinates ? (
          <Marker position={[Number(latitude), Number(longitude)]}>
            <Popup>{markerLabel}</Popup>
          </Marker>
        ) : null}

        {onPick ? <ClickHandler onPick={onPick} /> : null}
      </MapContainer>
    </div>
  )
}

export default EventLocationMap
