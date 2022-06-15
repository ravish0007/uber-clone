
import { useEffect, useState } from 'react'
import axios from 'axios'

export default function NavigationSelector ({ getLocation, source_, destination_, setPoint }) {
  const [focus, setFocus] = useState('source')

  const [source, setSource] = useState(source_.name || '')
  const [destination, setDestination] = useState(destination_.name || '')

  const [suggestions, setSuggestions] = useState([])

  useEffect(() => { setSource(source_.name) }, [source_])
  useEffect(() => { setDestination(destination_.name) }, [source_])

  function fetchLocationSuggestion (searchLocation, type) {
    axios.get(`https://geocode.maps.co/search?q=${searchLocation}`).then(result => {
      setSuggestions(result.data)
    })
  }

  return (
    <div className='p-2 absolute top-10 left-12 m:left-28 border-2 w-2/3 md:w-3/12 bg-white rounded-md space-y-2'>
      <p className='text-3xl font-normal'> {focus === 'source' ? 'Where can we pick you up?' : 'Where to?'}
      </p>

      <div className='space-y-2'>
        <input
          className='p-2 bg-slate-100 w-full'
          placeholder='Add a pickup location'
          onFocus={() => setFocus('source')}
          value={source}
          onChange={(e) => {
            setSource(e.target.value)
            setFocus('source')
            fetchLocationSuggestion(e.target.value, 'source')
          }}
        />
        <input
          className='p-2 bg-slate-100 w-full'
          placeholder='Enter your destination'
          onFocus={() => setFocus('destination')}
          value={destination}
          onChange={(e) => {
            setDestination(e.target.value)
            setFocus('destination')
            fetchLocationSuggestion(e.target.value, 'destination')
          }}
        />
      </div>

      {(focus === 'source') &&

        <div
          className='p-3 bg-gray-100 hover:cursor-pointer'
          onClick={getLocation}
        >
          Allow location access
        </div>}

      <div className='max-h-64 overflow-y-auto space-y-2'>
        {
      suggestions.map(suggestion => {
        return (
          <p
            className='p-2 border-2 border-gray-400 rounded-md text-slate-700 hover:bg-gray-100'
            onClick={() => {
              setPoint({
                name: suggestion.display_name,
                lat: suggestion.lat,
                lng: suggestion.lon
              }, focus)
              setSuggestions([])
            }}
          >
            {
              suggestion.display_name
            }
          </p>
        )
      })
    }
      </div>

    </div>

  )
}
