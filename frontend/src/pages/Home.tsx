import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-primary-dark px-2 py-6">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm flex flex-col items-center gap-4">
        <img src="/logo.svg" alt="Logo" className="w-20 h-20 mb-2" />
        <h1 className="text-2xl font-bold mb-1 text-primary text-center">Mercadin Controle</h1>
        <p className="text-gray-600 mb-2 text-center text-base">
          Organize suas compras de supermercado de forma simples e rápida!<br/>
          Cadastre produtos manualmente ou usando o scanner de código de barras.
        </p>
        <div className="flex flex-col w-full gap-3 mt-2">
          <Link to="/register" className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-lg text-center text-base transition">Registrar</Link>
          <Link to="/login" className="w-full border border-primary text-primary font-semibold py-3 rounded-lg text-center text-base hover:bg-primary/10 transition">Login</Link>
        </div>
      </div>
    </div>
  )
} 