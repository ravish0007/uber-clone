import { useEffect, useState, useRef } from 'react'
import io from 'socket.io-client'

const socket = io.connect(process.env.REACT_APP_WS_URL)

export default function Driver () {
  const [data, setData] = useState([])
  const position = useRef(null)

  useEffect(() => {
    socket.on('receive_location', (data) => {
      setData(x => x.concat(data))
    })
  }, [])

  useEffect(() => {
    sendLocation()
    // setInterval(sendLocation, 2000)
  }, [])

  const handlePosition = (pos) => {
    console.log('here')

    const lat = pos.coords.latitude
    const lng = pos.coords.longitude

    if (position.current === null) {
      position.current = { lng, lat }
      return
    }

    if (position.current.lat === lat && position.current.lng === lng) {
      return
    }

    position.current.lat = lat
    position.current.lng = lng

    socket.emit('send_location', { lat, lng })
  }

  const sendLocation = () => {
    // return navigator.geolocation.getCurrentPosition(handlePosition, () => console.log('error at geolocation'))
    return navigator.geolocation.watchPosition(handlePosition, () => console.log('error at geolocation'))
  }

  return (
    <>
      {data.map(blob => { return (<p> {JSON.stringify(blob)} </p>) })}
    </>
  )
}
