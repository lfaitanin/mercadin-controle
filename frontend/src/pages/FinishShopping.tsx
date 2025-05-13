import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import Spinner from './Spinner'

const api = import.meta.env.VITE_API_BASE

const store = localStorage.getItem('currentShoppingStore') || '';

export default function FinishShopping({ token }: { token: string }) {
  const [items] = useState(() => JSON.parse(localStorage.getItem('currentShopping') || '[]'))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const total = items.reduce((acc: number, p: any) => acc + Number(p.price) * Number(p.quantity), 0)

  async function finish() {
    setLoading(true)
    setError('')
    try {
      await axios.post(api + '/shopping', { items, store }, { headers: { Authorization: `Bearer ${token}` } })
      localStorage.removeItem('currentShopping')
      navigate('/')
    } catch (err: any) {
      setError('Erro ao finalizar compra. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary to-primary-dark py-6 px-2">
      <div className="bg-white rounded-2xl shadow-xl p-4 w-full max-w-sm flex flex-col items-center relative">
        <button type="button" onClick={()=>navigate(-1)} className="mb-2 self-start text-primary hover:underline text-base font-semibold px-2 py-1">← Voltar</button>
        <h2 className="text-xl font-bold text-primary mb-4 text-center">Finalizar compra</h2>
        <ul className="w-full space-y-2 mb-4">
          {items.map((item: any, idx: number) => (
            <li key={idx} className="bg-gray-50 rounded-lg shadow flex items-center justify-between px-3 py-2">
              <div>
                <span className="font-semibold text-base text-gray-800">{item.name}</span>
                <span className="ml-2 text-xs text-gray-500">x{item.quantity}</span>
              </div>
              <span className="font-bold text-primary text-base">R$ {(item.price * item.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-end items-center border-t pt-4 w-full mb-4">
          <span className="text-lg font-bold text-gray-700">Total: </span>
          <span className="ml-2 text-xl font-extrabold text-primary">R$ {total.toFixed(2)}</span>
        </div>
        {error && <div className="bg-red-100 text-red-700 px-3 py-2 rounded mb-2 text-sm w-full text-center">{error}</div>}
        <button
          onClick={finish}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg text-base transition disabled:opacity-50"
        >{loading ? (<><Spinner className="inline-block align-middle mr-2" />Salvando...</>) : 'Finalizar compra'}</button>
      </div>
    </div>
  )
} 