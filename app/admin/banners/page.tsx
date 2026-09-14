'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'
import Link from 'next/link'

export default function BannersAdminPage() {
  const [listaBanners, setListaBanners] = useState<any[]>([])
  const [tituloBanner, setTituloBanner] = useState('')
  const [imagemBanner, setImagemBanner] = useState<File | null>(null)
  const [carregandoBanner, setCarregandoBanner] = useState(false)
  const [mensagem, setMensagem] = useState('')

  async function carregarBanners() {
    const { data: ban } = await supabase.from('banners').select('*').order('id', { ascending: false })
    if (ban) setListaBanners(ban)
  }

  useEffect(() => {
    carregarBanners()
  }, [])

  const handleSalvarBanner = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imagemBanner) return
    setCarregandoBanner(true)
    setMensagem('Enviando banner...')

    const ext = imagemBanner.name.split('.').pop()
    const nomeArq = `banner_${Math.random()}.${ext}`
    
    const { error: uploadError } = await supabase.storage.from('produtos-imagens').upload(nomeArq, imagemBanner)
    if (uploadError) {
      alert(`Erro no upload: ${uploadError.message}`)
      setCarregandoBanner(false)
      return
    }

    const { data } = supabase.storage.from('produtos-imagens').getPublicUrl(nomeArq)
    
    const { error } = await supabase.from('banners').insert([{ titulo: tituloBanner, imagem_url: data.publicUrl }])
    
    if (!error) {
      setMensagem('Banner salvo com sucesso!')
      setTituloBanner('')
      setImagemBanner(null)
      carregarBanners()
    } else {
      setMensagem(`Erro ao salvar: ${error.message}`)
    }
    setCarregandoBanner(false)
  }

  const excluirBanner = async (id: number) => {
    if (!confirm('Deseja realmente excluir este banner?')) return
    const { error } = await supabase.from('banners').delete().eq('id', id)
    if (!error) {
      setMensagem('Banner excluído!')
      carregarBanners()
    }
  }

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-50 text-gray-900">
      <div className="max-w-[1400px] mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        
        {/* CABEÇALHO E MENU DE NAVEGAÇÃO */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold uppercase text-gray-700">Gerenciamento de Banners</h1>
            <p className="text-sm text-gray-500">Painel Administrativo</p>
          </div>
          <Link href="/admin" className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg transition-colors">
            ← Voltar ao Painel
          </Link>
        </div>

        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSalvarBanner} className="space-y-4 mb-8 bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Título do Banner</label>
              <input 
                type="text" 
                required 
                value={tituloBanner} 
                onChange={(e) => setTituloBanner(e.target.value)} 
                className="w-full p-2 border rounded-md bg-white" 
                placeholder="Ex: Campanha de Destaque"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Imagem do Banner</label>
              <input 
                type="file" 
                required 
                accept="image/*" 
                onChange={(e) => setImagemBanner(e.target.files?.[0] || null)} 
                className="w-full p-2 border rounded-md bg-white text-sm" 
              />
            </div>
            <button 
              type="submit" 
              disabled={carregandoBanner} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-md transition-colors disabled:opacity-50 shadow-sm"
            >
              {carregandoBanner ? 'Publicando...' : 'Publicar Banner'}
            </button>
          </form>

          <h3 className="font-bold border-b pb-2 mb-4 text-gray-800">Banners Cadastrados</h3>
          <div className="space-y-3">
            {listaBanners.map(b => (
              <div key={b.id} className="flex justify-between items-center text-sm bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                  {b.imagem_url && <img src={b.imagem_url} alt={b.titulo} className="w-16 h-10 object-cover rounded" />}
                  <span className="font-medium text-gray-800">{b.titulo}</span>
                </div>
                <button 
                  onClick={() => excluirBanner(b.id)} 
                  className="text-red-600 font-bold hover:underline text-xs bg-red-50 px-3 py-1.5 rounded transition-colors"
                >
                  Excluir
                </button>
              </div>
            ))}
            {listaBanners.length === 0 && (
              <p className="text-center text-gray-500 py-6">Nenhum banner cadastrado.</p>
            )}
          </div>
        </div>

        {mensagem && <p className="mt-6 text-center font-medium text-green-600">{mensagem}</p>}
      </div>
    </main>
  )
}