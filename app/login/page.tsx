'use client'

import { useState } from 'react'
import { supabase } from '@/utils/supabase'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setCarregando(true)
    setErro('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    })

    if (error) {
      setErro('E-mail ou senha incorretos')
    } else {
      router.push('/admin')
    }
    setCarregando(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4 text-gray-900">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold mb-6 text-center">Acesso Restrito</h1>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input type="password" required value={senha} onChange={(e) => setSenha(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" />
          </div>
          <button type="submit" disabled={carregando} className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50">
            {carregando ? 'Entrando...' : 'Entrar no Painel'}
          </button>
        </form>
        {erro && <p className="mt-4 text-center font-medium text-red-600">{erro}</p>}
      </div>
    </main>
  )
}