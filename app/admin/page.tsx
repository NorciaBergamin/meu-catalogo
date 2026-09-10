'use client'

import { useState } from 'react'
import { supabase } from '@/utils/supabase'

export default function AdminPanel() {
  const [nome, setNome] = useState('')
  const [preco, setPreco] = useState('')
  const [imagem, setImagem] = useState<File | null>(null)
  const [mensagem, setMensagem] = useState('')
  const [carregando, setCarregando] = useState(false)

  const handleSalvarProduto = async (e: React.FormEvent) => {
    e.preventDefault()
    setCarregando(true)
    setMensagem('Salvando...')
    
    const precoNumerico = parseFloat(preco.replace(',', '.'))
    if (isNaN(precoNumerico)) {
      setMensagem('Preço inválido')
      setCarregando(false)
      return
    }

    let imagemUrl = ''

    if (imagem) {
      const fileExt = imagem.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('produtos-imagens')
        .upload(fileName, imagem)

      if (uploadError) {
        setMensagem(`Erro na imagem: ${uploadError.message}`)
        setCarregando(false)
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from('produtos-imagens')
        .getPublicUrl(fileName)
        
      imagemUrl = publicUrlData.publicUrl
    }

    const { error } = await supabase
      .from('produtos')
      .insert([{ nome: nome, preco: precoNumerico, imagem_url: imagemUrl }])

    if (error) {
      setMensagem(`Erro ao salvar: ${error.message}`)
    } else {
      setMensagem('Produto salvo com sucesso!')
      setNome('')
      setPreco('')
      setImagem(null)
    }
    setCarregando(false)
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50 text-gray-900">
      <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold mb-6">Cadastrar Produto</h1>
        
        <form onSubmit={handleSalvarProduto} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto</label>
            <input type="text" required value={nome} onChange={(e) => setNome(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
            <input type="text" required value={preco} onChange={(e) => setPreco(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" placeholder="Ex: 99,90" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Foto do Produto</label>
            <input type="file" accept="image/*" onChange={(e) => setImagem(e.target.files?.[0] || null)} className="w-full p-2 border border-gray-300 rounded-md bg-white" />
          </div>
          <button type="submit" disabled={carregando} className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50">
            {carregando ? 'Enviando...' : 'Salvar Produto'}
          </button>
        </form>
        {mensagem && <p className="mt-4 text-center font-medium text-green-600">{mensagem}</p>}
      </div>
    </main>
  )
}