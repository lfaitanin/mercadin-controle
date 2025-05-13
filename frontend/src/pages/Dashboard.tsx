import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { FiLogOut } from 'react-icons/fi'
import dayjs from 'dayjs'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)
const api = import.meta.env.VITE_API_BASE

// Compra em andamento no localStorage
function getCurrentShopping() {
  return JSON.parse(localStorage.getItem('currentShopping') || '[]')
}

export default function Dashboard({token}:{token:string}){
  const [purchases,setPurchases] = useState<any[]>([])
  const [year, setYear] = useState('')
  const [month, setMonth] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const navigate = useNavigate()
  useEffect(()=>{
    axios.get(api+'/shopping',{headers:{Authorization:`Bearer ${token}`}})
         .then(r=>setPurchases(r.data))
  },[token])

  // Filtro local
  const filtered = purchases.filter(c => {
    const d = dayjs(c.created_at)
    if (year && d.year() !== Number(year)) return false
    if (month && d.month() + 1 !== Number(month)) return false
    if (startDate && d.isBefore(dayjs(startDate))) return false
    if (endDate && d.isAfter(dayjs(endDate))) return false
    return true
  })

  // Dados para o gráfico
  const monthlyTotals: Record<string, number> = {}
  purchases.forEach(c => {
    const d = dayjs(c.created_at)
    const key = d.format('YYYY-MM')
    monthlyTotals[key] = (monthlyTotals[key] || 0) + (c.total || 0)
  })
  const chartData = {
    labels: Object.keys(monthlyTotals),
    datasets: [
      {
        label: 'Total por mês',
        data: Object.values(monthlyTotals),
        backgroundColor: '#3B82F6', // Tailwind primary
      }
    ]
  }
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Gastos mensais', color: '#1e293b', font: { size: 18 } }
    },
    scales: {
      x: { ticks: { color: '#64748b' } },
      y: { ticks: { color: '#64748b' } }
    }
  }

  function logout() {
    localStorage.removeItem('token')
    navigate(0)
  }

  function startShopping() {
    localStorage.setItem('currentShopping', '[]')
    navigate('/shopping')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-dark flex flex-col items-center py-6 px-2">
      <div className="bg-white rounded-2xl shadow-xl p-5 w-full max-w-sm relative flex flex-col">
        <button
          onClick={logout}
          className="absolute right-4 top-4 flex items-center gap-1 text-primary hover:underline text-base font-medium"
        >
          <FiLogOut className="w-5 h-5" /> Sair
        </button>
        <div className="flex flex-col items-start gap-2 mb-6 mt-2 w-full">
          <h1 className="text-2xl font-bold text-primary">Minhas compras</h1>
          <button
            onClick={startShopping}
            className="bg-primary hover:bg-primary-dark text-white font-semibold px-4 py-2 rounded-lg shadow transition w-full text-center"
          >Nova compra</button>
        </div>
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex gap-2">
            <select className="input" value={year} onChange={e=>setYear(e.target.value)}>
              <option value="">Ano</option>
              {[...new Set(purchases.map(c=>dayjs(c.created_at).year()))].map(y=>(<option key={y} value={y}>{y}</option>))}
            </select>
            <select className="input" value={month} onChange={e=>setMonth(e.target.value)}>
              <option value="">Mês</option>
              {[...Array(12)].map((_,i)=>(<option key={i+1} value={i+1}>{i+1}</option>))}
            </select>
          </div>
          <div className="flex gap-2">
            <input type="date" className="input" value={startDate} onChange={e=>setStartDate(e.target.value)} />
            <input type="date" className="input" value={endDate} onChange={e=>setEndDate(e.target.value)} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 mb-4">
          <Bar data={chartData} options={chartOptions} height={200} />
        </div>
        <ul className="space-y-3 mb-6">
          {filtered.length === 0 && (
            <li className="text-center text-gray-400 py-8">Nenhuma compra registrada ainda.</li>
          )}
          {filtered.map(c=>(
            <li key={c.id} className="bg-gray-50 rounded-xl shadow flex items-center justify-between px-4 py-3 cursor-pointer" onClick={()=>navigate(`/shopping/${c.id}`)}>
              <div>
                <span className="font-semibold text-base text-gray-800">Compra # {c.store}</span>
                <span className="ml-2 text-xs text-gray-500">{new Date(c.created_at).toLocaleDateString()}</span>
              </div>
              <span className="font-bold text-primary text-base">R$ {c.total?.toFixed(2) ?? '--'}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
