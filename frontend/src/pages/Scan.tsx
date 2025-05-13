import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { useNavigate, useSearchParams } from 'react-router-dom'
import './Scan.css'
import Spinner from './Spinner'
const api = import.meta.env.VITE_API_BASE

function formatBRL(value: string) {
  if (!value) return ''
  const onlyNums = value.replace(/\D/g, '')
  const num = (Number(onlyNums) / 100).toFixed(2)
  return Number(num).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function parseBRL(value: string) {
  const onlyNums = value.replace(/\D/g, '')
  return (Number(onlyNums) / 100).toFixed(2)
}

export default function Scan({token}:{token:string}){
  const videoRef = useRef<HTMLVideoElement>(null)
  const [ean,setEan] = useState('')
  const [name,setName] = useState('')
  const [priceOptions, setPriceOptions] = useState<number[]>([])
  const [price,setPrice] = useState('')
  const [qty,setQty] = useState(1)
  const [saving,setSaving] = useState(false)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'scan'|'select'|'edit'>('scan')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const addToShopping = searchParams.get('addToShopping') === '1'

  useEffect(()=>{
    (async()=>{
      const stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}})
      videoRef.current!.srcObject = stream
      const detector = 'BarcodeDetector' in window
        ? new (window as any).BarcodeDetector({formats:['ean_13','ean_8']})
        : null
      async function tick(){
        if(detector && step==='scan'){
          const bs = await detector.detect(videoRef.current as any)
          if(bs.length) {
            setEan(bs[0].rawValue)
            setStep('select')
          }
        }
        requestAnimationFrame(tick)
      }
      tick()
    })()
  },[step])

  useEffect(()=>{
    if(!ean) return
    setLoading(true)
    axios.get(api+'/barcode/'+ean,{headers:{Authorization:`Bearer ${token}`}})
         .then(r=>{
           setName(r.data.name)
           // Suporte a múltiplos preços (exemplo: r.data.prices = [12.49, 9.99])
           if(r.data.prices && r.data.prices.length > 1) {
             setPriceOptions(r.data.prices)
             setPrice(r.data.prices[0].toString())
             setStep('select')
           } else {
             setPrice((r.data.prices?.[0] || r.data.price || '').toString())
             setStep('edit')
           }
         })
         .catch(()=>{
           setName('')
           setPrice('')
           setPriceOptions([])
           setStep('edit')
         })
         .finally(()=>setLoading(false))
  },[ean])

  function handleSelectPrice(p:number) {
    setPrice(p.toString())
    setStep('edit')
  }

  async function save(){
    setSaving(true)
    if(addToShopping) {
      // Adiciona ao carrinho local
      const item = {ean, name, price: Number(price), quantity: qty}
      const current = JSON.parse(localStorage.getItem('currentShopping') || '[]')
      current.push(item)
      localStorage.setItem('currentShopping', JSON.stringify(current))
      setSaving(false)
      navigate('/shopping')
    } else {
      // Salva direto no backend (modo antigo)
      await axios.post(
        api+'/purchases',
        {ean,name,price:Number(price),quantity:qty},
        {headers:{Authorization:`Bearer ${token}`}}
      )
      setSaving(false)
      history.back()
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary to-primary-dark py-6 px-2">
      <div className="bg-white rounded-2xl shadow-xl p-4 w-full max-w-sm flex flex-col items-center relative">
        <button type="button" onClick={()=>navigate(-1)} className="mb-2 self-start text-primary hover:underline text-base font-semibold px-2 py-1">← Voltar</button>
        <h2 className="text-xl font-bold text-primary mb-2 text-center">Escaneie a etiqueta do produto</h2>
        <p className="text-gray-500 text-center mb-4 text-base">Aponte a câmera para o código de barras da etiqueta. O produto será preenchido automaticamente.</p>
        <div className="relative w-full flex justify-center mb-4">
          <video ref={videoRef} autoPlay muted className="rounded-xl border-4 border-primary w-full h-48 object-cover bg-black"/>
          {loading && <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl"><span className="text-primary font-bold animate-pulse">Buscando produto...</span></div>}
        </div>
        {step === 'select' && priceOptions.length > 1 && (
          <div className="w-full mb-4">
            <div className="text-gray-700 font-medium mb-2 text-center">Selecione o valor:</div>
            <div className="flex gap-3 justify-center flex-wrap">
              {priceOptions.map((p, i) => (
                <button
                  key={i}
                  onClick={()=>handleSelectPrice(p)}
                  className={`px-4 py-2 rounded-lg border font-bold text-lg transition ${price===p.toString() ? 'bg-primary text-white border-primary' : 'bg-gray-100 text-primary border-gray-300 hover:bg-primary/10'}`}
                >R$ {p.toFixed(2)}</button>
              ))}
            </div>
          </div>
        )}
        {(step === 'edit' || priceOptions.length <= 1) && (
          <form className="w-full space-y-3 mt-2" onSubmit={e=>{e.preventDefault();save()}}>
            <input className="input text-base" placeholder="Produto" value={name} onChange={e=>setName(e.target.value)} required />
            <input
              className="input text-base"
              placeholder="Preço"
              value={formatBRL(price)}
              onChange={e => setPrice(parseBRL(e.target.value))}
              required
            />
            <input type="number" className="input text-base" value={qty} min={1} onChange={e=>setQty(Number(e.target.value))} required />
            <button
              type="submit"
              disabled={saving || !price || !name}
              className="w-full bg-primary hover:bg-primary-dark transition text-white py-3 rounded-lg font-semibold shadow text-base disabled:opacity-50"
            >{saving ? (<><Spinner className="inline-block align-middle mr-2" />Salvando...</>) : "Salvar"}</button>
          </form>
        )}
      </div>
    </div>
  )
}

