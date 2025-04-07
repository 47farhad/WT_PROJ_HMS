import { Routes, Route } from 'react-router-dom'

import Dashboard from './Dashboard.tsx'
import Messages from './Messages.tsx'

function MainPage() {
  return (
    <div>
      {/* Navbar here */}

      <Routes>
        <Route path='/' element={<Dashboard/>}/>
        <Route path='/messages/' element={<Messages/>}/>

        {/* Other pages here, like as seen on the navbar */}


      </Routes>
    </div>
  )
}

export default MainPage