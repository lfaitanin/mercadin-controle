import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

const api = import.meta.env.VITE_API_BASE

export default function ShoppingDetail({ token }: { token: string }) {
  const { id } = useParams()
  const [shopping, setShopping] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    axios.get(api + '/shopping/' + id, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setShopping(r.data))
      .finally(() => setLoading(false))
  }, [id, token])

  const total = shopping?.items?.reduce((acc: number, p: any) => acc + Number(p.price) * Number(p.quantity), 0) || 0

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary to-primary-dark py-6 px-2">
      <div className="bg-white rounded-2xl shadow-xl p-4 w-full max-w-sm flex flex-col items-center relative">
        <button type="button" onClick={()=>navigate(-1)} className="mb-2 self-start text-primary hover:underline text-base font-semibold px-2 py-1">← Voltar</button>
        <h2 className="text-xl font-bold text-primary mb-4 text-center">Detalhes da compra</h2>
        {loading && <div className="text-center text-gray-400 py-4">Carregando...</div>}
        {!loading && shopping && (
          <>
            <div className="text-gray-500 text-sm mb-2">Data: {new Date(shopping.created_at).toLocaleString()}</div>
            <ul className="w-full space-y-2 mb-4">
              {shopping.items.map((item: any, idx: number) => (
                <li key={idx} className="bg-gray-50 rounded-lg shadow flex items-center justify-between px-3 py-2">
                  <div>
                    <span className="font-semibold text-base text-gray-800">{item.product?.name}</span>
                    <span className="ml-2 text-xs text-gray-500">x{item.quantity}</span>
                  </div>
                  <span className="font-bold text-primary text-base">R$ {(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-end items-center border-t pt-4 w-full mb-2">
              <span className="text-lg font-bold text-gray-700">Total: </span>
              <span className="ml-2 text-xl font-extrabold text-primary">R$ {total.toFixed(2)}</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
} 