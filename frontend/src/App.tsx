import { Routes, Route, Navigate } from 'react-router-dom'

import LoginPage from './pages/LoginPage.tsx'
import MainPage from './pages/MainPage.tsx'

function App() {
  return (
    <Routes>
        <Route path='/' element={<Navigate to="/main"/>}/>

        <Route path='/main/*' element={<MainPage/>}/>
        <Route path='/login' element={<LoginPage/>}/>

        <Route path='/*' element={<div>404 not found</div>}/>
    </Routes>
  )
}

export default App