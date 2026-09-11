'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'
import { GoogleGenAI } from '@google/genai'

export default function AdminPanel() {
  const [abaAtiva, setAbaAtiva] = useState('produto')
  const [mensagem, setMensagem] = useState('')
  const [categoriasCadastradas, setCategoriasCadastradas] = useState<any[]>([])

  // Busca categorias ao abrir o painel
  useEffect(() => {
    async function carregarCategorias() {
      const { data } = await supabase.from('categorias').select('*').order('nome')
      if (data) {
        setCategoriasCadastradas(data)
        if (data.length > 0) setCategoria(data[0].nome)
      }
    }
    carregarCategorias()
  }, [])

  // Estados Produto
  const [nome, setNome] = useState('')
  const [preco, setPreco] = useState('')
  const [categoria, setCategoria] = useState('')
  const [descricao, setDescricao] = useState('')
  const [imagemProduto, setImagemProduto] = useState<File | null>(null)
  const [carregandoProduto, setCarregandoProduto] = useState(false)
  const [gerandoIA, setGerandoIA] = useState(false)

  // Estados Banner
  const [tituloBanner, setTituloBanner] = useState('')
  const [imagemBanner, setImagemBanner] = useState<File | null>(null)
  const [carregandoBanner, setCarregandoBanner] = useState(false)

  // Estados Categoria
  const [novaCategoria, setNovaCategoria] = useState('')
  const [carregandoCategoria, setCarregandoCategoria] = useState(false)

  const gerarDescricaoIA = async () => {
    if (!nome) return setMensagem('Digite o nome do produto primeiro!')
    setGerandoIA(true)
    setMensagem('IA escrevendo...')
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY })
      const prompt = `Atue como um especialista em marketing. Crie uma descrição comercial curta e altamente persuasiva (máximo de 3 frases) para um produto de e-commerce. O produto é: ${nome}. Categoria: ${categoria}. Foco em atrair o cliente e gerar vendas. Retorne APENAS o texto da descrição.`
      const response = await ai.models.generateContent({ model: 'gemini-3.6-flash', contents: prompt })
      setDescricao(response.text || '')
      setMensagem('Descrição gerada!')
    } catch (error) {
      setMensagem('Erro ao gerar IA.')
    }
    setGerandoIA(false)
  }

  const handleSalvarProduto = async (e: React.FormEvent) => {
    e.preventDefault()
    setCarregandoProduto(true)
    setMensagem('Salvando produto...')
    const precoNumerico = parseFloat(preco.replace(',', '.'))
    
    let imagemUrl = ''
    if (imagemProduto) {
      const fileExt = imagemProduto.name.split('.').pop()
      const fileName = `produto_${Math.random()}.${fileExt}`
      await supabase.storage.from('produtos-imagens').upload(fileName, imagemProduto)
      const { data } = supabase.storage.from('produtos-imagens').getPublicUrl(fileName)
      imagemUrl = data.publicUrl
    }

    const { error } = await supabase.from('produtos').insert([{ nome, preco: precoNumerico, imagem_url: imagemUrl, categoria, descricao }])
    if (!error) {
      setMensagem('Produto salvo!')
      setNome(''); setPreco(''); setDescricao(''); setImagemProduto(null)
    }
    setCarregandoProduto(false)
  }

  const handleSalvarBanner = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imagemBanner) return setMensagem('Selecione uma imagem')
    setCarregandoBanner(true)
    setMensagem('Salvando banner...')

    const fileExt = imagemBanner.name.split('.').pop()
    const fileName = `banner_${Math.random()}.${fileExt}`
    await supabase.storage.from('produtos-imagens').upload(fileName, imagemBanner)
    const { data } = supabase.storage.from('produtos-imagens').getPublicUrl(fileName)

    const { error } = await supabase.from('banners').insert([{ titulo: tituloBanner, imagem_url: data.publicUrl }])
    if (!error) {
      setMensagem('Banner salvo!')
      setTituloBanner(''); setImagemBanner(null)
    }
    setCarregandoBanner(false)
  }

  const handleSalvarCategoria = async (e: React.FormEvent) => {
    e.preventDefault()
    setCarregandoCategoria(true)
    const { error } = await supabase.from('categorias').insert([{ nome: novaCategoria }])
    if (!error) {
      setMensagem('Categoria criada!')
      setNovaCategoria('')
      const { data } = await supabase.from('categorias').select('*').order('nome')
      if (data) setCategoriasCadastradas(data)
    } else {
      setMensagem(`Erro: ${error.message}`)
    }
    setCarregandoCategoria(false)
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50 text-gray-900">
      <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        
        <div className="flex border-b border-gray-200 mb-6 text-sm">
          <button onClick={() => { setAbaAtiva('produto'); setMensagem(''); }} className={`flex-1 py-2 font-semibold ${abaAtiva === 'produto' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Produtos</button>
          <button onClick={() => { setAbaAtiva('banner'); setMensagem(''); }} className={`flex-1 py-2 font-semibold ${abaAtiva === 'banner' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Banners</button>
          <button onClick={() => { setAbaAtiva('categoria'); setMensagem(''); }} className={`flex-1 py-2 font-semibold ${abaAtiva === 'categoria' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Categorias</button>
        </div>

        {abaAtiva === 'produto' && (
          <form onSubmit={handleSalvarProduto} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome do Produto</label>
              <input type="text" required value={nome} onChange={(e) => setNome(e.target.value)} className="w-full p-2 border rounded-md" />
            </div>
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-sm font-medium mb-1">Preço (R$)</label>
                <input type="text" required value={preco} onChange={(e) => setPreco(e.target.value)} className="w-full p-2 border rounded-md" />
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-medium mb-1">Categoria</label>
                <select required value={categoria} onChange={(e) => setCategoria(e.target.value)} className="w-full p-2 border rounded-md bg-white">
                  {categoriasCadastradas.length === 0 && <option value="">Crie uma categoria primeiro</option>}
                  {categoriasCadastradas.map(cat => (
                    <option key={cat.id} value={cat.nome}>{cat.nome}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <label className="block text-sm font-medium">Descrição</label>
                <button type="button" onClick={gerarDescricaoIA} disabled={gerandoIA || !nome} className="text-xs bg-purple-100 text-purple-700 font-bold px-2 py-1 rounded">
                  {gerandoIA ? 'Gerando...' : '✨ Gerar com IA'}
                </button>
              </div>
              <textarea rows={3} value={descricao} onChange={(e) => setDescricao(e.target.value)} className="w-full p-2 border rounded-md text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Foto</label>
              <input type="file" accept="image/*" onChange={(e) => setImagemProduto(e.target.files?.[0] || null)} className="w-full p-2 border rounded-md bg-white" />
            </div>
            <button type="submit" disabled={carregandoProduto || categoriasCadastradas.length === 0} className="w-full bg-blue-600 text-white font-bold py-2 rounded-md">
              Salvar Produto
            </button>
          </form>
        )}

        {abaAtiva === 'banner' && (
          <form onSubmit={handleSalvarBanner} className="space-y-4">
            <div><label className="block text-sm mb-1">Título</label><input type="text" required value={tituloBanner} onChange={(e) => setTituloBanner(e.target.value)} className="w-full p-2 border rounded-md" /></div>
            <div><label className="block text-sm mb-1">Imagem</label><input type="file" required accept="image/*" onChange={(e) => setImagemBanner(e.target.files?.[0] || null)} className="w-full p-2 border rounded-md bg-white" /></div>
            <button type="submit" disabled={carregandoBanner} className="w-full bg-blue-600 text-white font-bold py-2 rounded-md">Publicar Banner</button>
          </form>
        )}

        {abaAtiva === 'categoria' && (
          <form onSubmit={handleSalvarCategoria} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome da Nova Categoria</label>
              <input type="text" required value={novaCategoria} onChange={(e) => setNovaCategoria(e.target.value)} className="w-full p-2 border rounded-md" placeholder="Ex: Acessórios" />
            </div>
            <button type="submit" disabled={carregandoCategoria} className="w-full bg-blue-600 text-white font-bold py-2 rounded-md">
              Salvar Categoria
            </button>

            <div className="mt-6">
              <h3 className="font-semibold text-sm mb-2">Categorias Atuais:</h3>
              <ul className="text-sm text-gray-600 bg-gray-50 border rounded-md p-3 max-h-32 overflow-y-auto">
                {categoriasCadastradas.map(c => <li key={c.id} className="py-1 border-b last:border-0">{c.nome}</li>)}
              </ul>
            </div>
          </form>
        )}

        {mensagem && <p className="mt-4 text-center font-medium text-green-600">{mensagem}</p>}
      </div>
    </main>
  )
}