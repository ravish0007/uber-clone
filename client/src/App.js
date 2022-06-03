import React, { useRef, useEffect, useState } from 'react'

import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = 'pk.eyJ1Ijoidml2ZWswMDkiLCJhIjoiY2wxb3NsbWR5MDEwZjNpcHQ5aHpzOGs2bSJ9.hu2KGr7-tFgdBxyCTf_HkA'

export default function App () {
  const mapContainer = useRef(null)
  const tooltipContainer = useRef(null)
  const map = useRef(null)

  const [lng, setLng] = useState(-70.9)
  const [lat, setLat] = useState(42.35)
  const [zoom, setZoom] = useState(15)

  const handlePosition = (position) => {
    const latitude = position.coords.latitude
    const longitude = position.coords.longitude

    setLng(longitude)
    setLat(latitude)

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [longitude, latitude],
      zoom: zoom
    })
  }

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(handlePosition, () => console.log('error at geolocation'))
  }, [])

  useEffect(() => {
    if (map.current) return // initialize map only once

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [lng, lat],
      zoom: zoom
    })

    // const from = new mapboxgl.Marker(tooltipContainer).setLngLat([lng, lat]).addTo(map)
  })

  return (
    <div>
      <div ref={mapContainer} className='map-container' />
    </div>
  )
}
