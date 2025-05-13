import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Scan from './pages/Scan'
import Shopping from './pages/Shopping'
import FinishShopping from './pages/FinishShopping'
import ShoppingDetail from './pages/ShoppingDetail'
import { useState } from 'react'

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))

  function onAuth(t: string) {
    localStorage.setItem('token', t)
    setToken(t)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-dark dark:bg-gray-800">
      {/* Rotas */}
      {(!token) ? (
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login onAuth={onAuth} />} />
          <Route path="/register" element={<Register onAuth={onAuth} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      ) : (
        <Routes>
          <Route path="/" element={<Dashboard token={token} />} />
          <Route path="/scan" element={<Scan token={token} />} />
          <Route path="/shopping" element={<Shopping />} />
          <Route path="/shopping/finish" element={<FinishShopping token={token} />} />
          <Route path="/shopping/:id" element={<ShoppingDetail token={token} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </div>
  )
}