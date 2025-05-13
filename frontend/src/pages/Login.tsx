import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import Spinner from './Spinner'

const api = import.meta.env.VITE_API_BASE

export default function Login({ onAuth }: { onAuth: (t: string) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await axios.post(api + '/auth/login', { email, password })
      onAuth(res.data.token)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.error || 'E-mail ou senha inválidos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-2 py-6">
      <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm space-y-6 relative">
        <button type="button" onClick={()=>navigate(-1)} className="absolute left-3 top-3 text-primary hover:underline text-base font-semibold px-2 py-1">← Voltar</button>
        <h2 className="text-2xl font-bold text-primary mb-2 text-center">Entrar</h2>
        {error && <div className="bg-red-100 text-red-700 px-3 py-2 rounded mb-2 text-sm">{error}</div>}
        <input
          type="email"
          className="input text-base"
          placeholder="E-mail"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="input text-base"
          placeholder="Senha"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-lg text-base transition disabled:opacity-50"
          disabled={loading}
        >{loading ? (<><Spinner className="inline-block align-middle mr-2" />Entrando...</>) : 'Entrar'}</button>
      </form>
    </div>
  )
}
