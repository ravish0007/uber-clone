import React, { useRef, useEffect, useState } from 'react'
import axios from 'axios'
import io from 'socket.io-client'

import mapboxgl from 'mapbox-gl'
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions'
import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css'
import 'mapbox-gl/dist/mapbox-gl.css'

import NavigationSelector from './NavigationSelector'

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_API
const socket = io.connect('https://xpve.rocks:3001')

export default function Map () {
  const mapContainer = useRef(null)

  const map = useRef(null)

  const [lng, setLng] = useState(-70.9)
  const [lat, setLat] = useState(42.35)

  const zoom = 15

  const [source, setSource] = useState({ name: '', lat: null, lng: null })
  const [destination, setDestination] = useState({ name: '', lat: null, lng: null })

  const position = useRef(null)

  function getDirection (source, nextHeading) {
    const y = Math.sin(nextHeading.lng - source.lng) * Math.cos(nextHeading.lat)
    const x = Math.cos(source.lat) * Math.sin(nextHeading.lat) -
        Math.sin(source.lat) * Math.cos(nextHeading.lat) * Math.cos(nextHeading.lng - source.lng)
    const headingAngle = Math.atan2(y, x) * 180 / Math.PI
    return headingAngle
  }

  useEffect(() => {
    socket.on('receive_location', (data) => {
      if (position.current.lat === data.lat && position.current.lng === data.lng) {
        return
      }

      const rotation = getDirection(position.current, data)
      console.log(rotation)
      position.current = data

      map.current
        .getSource('taxiDriver')
        .setData(getgeojson(data, rotation))
      console.log(data)
    })
  }, [socket])

  function getgeojson (position, rotation = 0) {
    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [position.lng, position.lat]
            // coordinates: [12.961, 77.644]
          },
          properties: {
            // rotation: 180 - rotation,
            rotation: rotation,
            icon: 'taxi'
          }
        }
      ]
    }
  }

  useEffect(() => {
    if (source.lat == null || source.lng == null ||
      destination.lat == null || destination.lng == null) {
      return
    }

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [source.lng, source.lat],
      zoom: zoom
    })

    const directions = new MapboxDirections({
      accessToken: mapboxgl.accessToken,
      interactive: false,
      unit: 'metric',
      profile: 'mapbox/driving',
      controls: {
        inputs: false,
        instructions: false
      }
    })

    new mapboxgl.Marker().setLngLat([source.lng, source.lat]).addTo(map.current)
    new mapboxgl.Marker().setLngLat([destination.lng, destination.lat]).addTo(map.current)

    map.current.on('load', function () {
      directions.actions.setOriginFromCoordinates([
        source.lng,
        source.lat
      ])
      directions.actions.setDestinationFromCoordinates([
        destination.lng,
        destination.lat
      ])
    })

    map.current.setZoom(zoom)
    map.current.addControl(directions, 'top-left')
    // map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right')

    map.current.on('load', () => {
      map.current.loadImage('https://d1a3f4spazzrp4.cloudfront.net/car-types/map70px/product/map-uberx.png',
        (error, image) => {
          if (error) throw error
          map.current.addImage('taxi', image)

          map.current.addSource('taxiDriver', {
            type: 'geojson',
            data: getgeojson({ lat: source.lat, lng: source.lng })
          })

          map.current.addLayer({
            id: 'taxiDriver',
            type: 'symbol',
            source: 'taxiDriver',
            layout: {
              'icon-image': 'taxi',
              'icon-size': 0.75,
              'icon-rotate': ['get', 'rotation']
            }
          })
        })
    })

    position.current = { lng: source.lng, lat: source.lat }
  }, [source, destination])

  function setPoint (data, type) {
    if (type === 'source') {
      setSource(data)
    } else {
      setDestination(data)
    }

    map.current.flyTo({
      center: [data.lng, data.lat],
      speed: 3
    })
    new mapboxgl.Marker().setLngLat([data.lng, data.lat]).addTo(map.current)
  }

  function fetchLocationAddress (latitude, longitude) {
    axios.get(`https://geocode.maps.co/reverse?lat=${latitude}&lon=${longitude}`).then(result => {
      setSource({
        name: result.data.display_name,
        lat: latitude,
        lng: longitude
      })
    }
    )
  }

  const handlePosition = (position) => {
    const latitude = position.coords.latitude
    const longitude = position.coords.longitude

    setLng(longitude)
    setLat(latitude)

    map.current.flyTo({
      center: [longitude, latitude],
      speed: 3
    })

    new mapboxgl.Marker().setLngLat([longitude, latitude]).addTo(map.current)
    fetchLocationAddress(latitude, longitude)
  }

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(handlePosition, () => console.log('error at geolocation'))
  }

  useEffect(() => {
    if (map.current) return // initialize map only once

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [lng, lat],
      zoom: zoom
    })
  })

  return (
    <div className='relative'>
      <div ref={mapContainer} className='map-container' />
      <NavigationSelector
        getLocation={getLocation}
        source_={source}
        destination_={destination}
        setPoint={setPoint}
      />
    </div>
  )
}
