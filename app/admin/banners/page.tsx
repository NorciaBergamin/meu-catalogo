'use client'

import { useState } from 'react'
import { supabase } from '@/utils/supabase'

export default function AdminBanners() {
  const [titulo, setTitulo] = useState('')
  const [imagem, setImagem] = useState<File | null>(null)
  const [mensagem, setMensagem] = useState('')
  const [carregando, setCarregando] = useState(false)

  const handleSalvarBanner = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imagem) {
      setMensagem('Selecione uma imagem para o banner')
      return
    }

    setCarregando(true)
    setMensagem('Salvando banner...')

    const fileExt = imagem.name.split('.').pop()
    const fileName = `banner_${Math.random()}.${fileExt}`
    
    // Usando o mesmo bucket de produtos para facilitar
    const { error: uploadError } = await supabase.storage.from('produtos-imagens').upload(fileName, imagem)
    
    if (uploadError) {
      setMensagem(`Erro no upload: ${uploadError.message}`)
      setCarregando(false)
      return
    }

    const { data: publicUrlData } = supabase.storage.from('produtos-imagens').getPublicUrl(fileName)
    const imagemUrl = publicUrlData.publicUrl

    const { error } = await supabase.from('banners').insert([{ titulo, imagem_url: imagemUrl }])

    if (error) {
      setMensagem(`Erro ao salvar: ${error.message}`)
    } else {
      setMensagem('Banner publicado com sucesso!')
      setTitulo('')
      setImagem(null)
    }
    setCarregando(false)
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50 text-gray-900">
      <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold mb-6">Adicionar Novo Banner</h1>
        <form onSubmit={handleSalvarBanner} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Título do Banner (Aparece na foto)</label>
            <input type="text" required value={titulo} onChange={(e) => setTitulo(e.target.value)} className="w-full p-2 border rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Imagem do Banner</label>
            <input type="file" required accept="image/*" onChange={(e) => setImagem(e.target.files?.[0] || null)} className="w-full p-2 border rounded-md bg-white" />
          </div>
          <button type="submit" disabled={carregando} className="w-full bg-blue-600 text-white font-bold py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">
            {carregando ? 'Publicando...' : 'Publicar Banner'}
          </button>
        </form>
        {mensagem && <p className="mt-4 text-center font-medium text-green-600">{mensagem}</p>}
      </div>
    </main>
  )
}