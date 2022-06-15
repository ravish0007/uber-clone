import { Route, Routes } from 'react-router'

import Map from './components/Map'
import Driver from './components/Driver'

export default function App () {
  return (
    <Routes>
      <Route path='/' element={<Map />} />
      <Route path='/driver' element={<Driver />} />
    </Routes>

  )
}
