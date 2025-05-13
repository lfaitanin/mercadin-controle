import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Spinner from './Spinner'

export default function Shopping() {
  const [items, setItems] = useState(() => JSON.parse(localStorage.getItem('currentShoppingItems') || '[]'))
  const [store, setStore] = useState(() => localStorage.getItem('currentShoppingStore') || '')
  const [showStoreModal, setShowStoreModal] = useState(!store)
  const [editIdx, setEditIdx] = useState<number|null>(null)
  const [editItem, setEditItem] = useState<any>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (store) localStorage.setItem('currentShoppingStore', store)
  }, [store])

  function addProduct() {
    navigate('/scan?addToShopping=1')
  }

  function removeItem(idx: number) {
    const newItems = items.slice()
    newItems.splice(idx, 1)
    setItems(newItems)
    localStorage.setItem('currentShoppingItems', JSON.stringify(newItems))
  }

  function startEdit(idx: number) {
    setEditIdx(idx)
    setEditItem({ ...items[idx] })
  }

  function cancelEdit() {
    setEditIdx(null)
    setEditItem(null)
  }

  function saveEdit() {
    if (editIdx === null) return
    const newItems = items.slice()
    newItems[editIdx] = {
      ...editItem,
      price: Number(editItem.price),
      quantity: Number(editItem.quantity)
    }
    setItems(newItems)
    localStorage.setItem('currentShoppingItems', JSON.stringify(newItems))
    setEditIdx(null)
    setEditItem(null)
  }

  function finalize() {
    localStorage.setItem('currentShoppingStore', store)
    navigate('/shopping/finish')
  }

  const total = items.reduce((acc: number, p: any) => acc + Number(p.price) * Number(p.quantity), 0)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary to-primary-dark py-6 px-2">
      <div className="bg-white rounded-2xl shadow-xl p-4 w-full max-w-sm flex flex-col items-center relative">
        <button type="button" onClick={()=>navigate(-1)} className="mb-2 self-start text-primary hover:underline text-base font-semibold px-2 py-1">← Voltar</button>
        <h2 className="text-xl font-bold text-primary mb-2 text-center">Compra em andamento</h2>
        <div className="w-full mb-4">
          <label className="block text-gray-700 text-sm mb-1">Nome da loja</label>
          <input
            className="input text-base"
            placeholder="Ex: Supermercado X"
            value={store}
            onChange={e => setStore(e.target.value)}
            required
            onFocus={() => setShowStoreModal(false)}
          />
        </div>
        <ul className="w-full space-y-2 mb-4">
          {items.length === 0 && <li className="text-center text-gray-400 py-4">Nenhum produto adicionado.</li>}
          {items.map((item: any, idx: number) => (
            <li key={idx} className="bg-gray-50 rounded-lg shadow flex items-center justify-between px-3 py-2">
              <div onClick={()=>startEdit(idx)} className="flex-1 cursor-pointer">
                <span className="font-semibold text-base text-gray-800">{item.name}</span>
                <span className="ml-2 text-xs text-gray-500">x{item.quantity}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-primary text-base">R$ {(Number(item.price) * Number(item.quantity)).toFixed(2)}</span>
                <button onClick={()=>removeItem(idx)} className="text-red-500 hover:underline text-xs">remover</button>
              </div>
            </li>
          ))}
        </ul>
        <button
          onClick={addProduct}
          className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-lg text-base mb-4 transition"
        >Adicionar produto</button>
        <div className="flex justify-end items-center border-t pt-4 w-full mb-4">
          <span className="text-lg font-bold text-gray-700">Total: </span>
          <span className="ml-2 text-xl font-extrabold text-primary">R$ {total.toFixed(2)}</span>
        </div>
        <button
          onClick={finalize}
          disabled={items.length === 0 || !store}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg text-base transition disabled:opacity-50"
        >{false ? (<><Spinner className="inline-block align-middle mr-2" />Finalizando...</>) : 'Finalizar compra'}</button>

        {/* Modal de edição */}
        {editIdx !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-xs flex flex-col gap-3 relative">
              <button onClick={cancelEdit} className="absolute right-3 top-2 text-gray-400 text-xl">×</button>
              <h3 className="text-lg font-bold text-primary mb-2">Editar produto</h3>
              <input
                className="input text-base"
                placeholder="Produto"
                value={editItem?.name || ''}
                onChange={e=>setEditItem((ei:any)=>({...ei, name: e.target.value}))}
                required
              />
              <input
                className="input text-base"
                placeholder="Preço"
                type="number"
                value={editItem?.price || ''}
                onChange={e=>setEditItem((ei:any)=>({...ei, price: e.target.value}))}
                required
              />
              <input
                className="input text-base"
                placeholder="Quantidade"
                type="number"
                min={1}
                value={editItem?.quantity || 1}
                onChange={e=>setEditItem((ei:any)=>({...ei, quantity: e.target.value}))}
                required
              />
              <button
                onClick={saveEdit}
                className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-2 rounded-lg text-base transition"
              >Salvar</button>
            </div>
          </div>
        )}

        {/* Modal para nome da loja ao iniciar */}
        {showStoreModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-xs flex flex-col gap-3 relative">
              <h3 className="text-lg font-bold text-primary mb-2">Nome da loja</h3>
              <input
                className="input text-base"
                placeholder="Ex: Supermercado X"
                value={store}
                onChange={e => setStore(e.target.value)}
                autoFocus
              />
              <button
                onClick={() => setShowStoreModal(false)}
                disabled={!store}
                className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-2 rounded-lg text-base transition disabled:opacity-50"
              >Confirmar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 