import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { Bike, MapPin } from 'lucide-react'
import { io } from 'socket.io-client'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// 🔥 Fix Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom Icons
const restaurantIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448630.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
})

const deliveryIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2972/2972185.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
})

const customerIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/25/25694.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
})

// Component to recenter map
function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, map.getZoom())
  }, [center, map])
  return null
}

interface TrackingMapProps {
  orderId: string
  restaurantLocation: { lat: number; lng: number }
  customerLocation: { lat: number; lng: number }
}

export function TrackingMap({ orderId, restaurantLocation, customerLocation }: TrackingMapProps) {
  const [deliveryLocation, setDeliveryLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    restaurantLocation.lat,
    restaurantLocation.lng,
  ])

  // Socket.io connection for real-time location updates
  useEffect(() => {
    const socket = io('http://localhost:5000', {
      transports: ['websocket'],
    })

    socket.emit('join-order-room', orderId)

    socket.on('delivery-location-update', (data: any) => {
      console.log('🚴 Delivery location updated:', data)
      setDeliveryLocation({ lat: data.latitude, lng: data.longitude })
      setMapCenter([data.latitude, data.longitude])
    })

    return () => {
      socket.disconnect()
    }
  }, [orderId])

  return (
    <div className="relative h-[400px] w-full overflow-hidden rounded-3xl border border-charcoal/10">
      <MapContainer
        center={mapCenter}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Restaurant Marker */}
        <Marker position={[restaurantLocation.lat, restaurantLocation.lng]} icon={restaurantIcon}>
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">Restaurant</p>
              <p className="text-xs text-gray-500">Order pickup location</p>
            </div>
          </Popup>
        </Marker>

        {/* Customer Marker */}
        <Marker position={[customerLocation.lat, customerLocation.lng]} icon={customerIcon}>
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">Your Location</p>
              <p className="text-xs text-gray-500">Delivery address</p>
            </div>
          </Popup>
        </Marker>

        {/* Delivery Partner Marker */}
        {deliveryLocation && (
          <Marker position={[deliveryLocation.lat, deliveryLocation.lng]} icon={deliveryIcon}>
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">Delivery Partner</p>
                <p className="text-xs text-gray-500">On the way</p>
              </div>
            </Popup>
          </Marker>
        )}

        <RecenterMap center={mapCenter} />
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-2 rounded-2xl bg-white/95 p-3 shadow-warm backdrop-blur-sm">
        <div className="flex items-center gap-2 text-xs">
          <div className="h-3 w-3 rounded-full bg-orange-500" />
          <span className="font-medium text-charcoal">Restaurant</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="h-3 w-3 rounded-full bg-tomato" />
          <span className="font-medium text-charcoal">Delivery Partner</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="h-3 w-3 rounded-full bg-blue-500" />
          <span className="font-medium text-charcoal">Your Location</span>
        </div>
      </div>
    </div>
  )
}