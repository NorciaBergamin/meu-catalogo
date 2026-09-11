'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'
import { GoogleGenAI } from '@google/genai'

export default function AdminPanel() {
  const [abaAtiva, setAbaAtiva] = useState('produto')
  const [mensagem, setMensagem] = useState('')
  
  // Listagens
  const [categoriasCadastradas, setCategoriasCadastradas] = useState<any[]>([])
  const [listaProdutos, setListaProdutos] = useState<any[]>([])
  const [listaBanners, setListaBanners] = useState<any[]>([])

  async function carregarDados() {
    const { data: cat } = await supabase.from('categorias').select('*').order('nome')
    if (cat) {
      setCategoriasCadastradas(cat)
      if (cat.length > 0 && !categoria) setCategoria(cat[0].nome)
    }
    const { data: prod } = await supabase.from('produtos').select('*').order('id', { ascending: false })
    if (prod) setListaProdutos(prod)
    
    const { data: ban } = await supabase.from('banners').select('*').order('id', { ascending: false })
    if (ban) setListaBanners(ban)
  }

  useEffect(() => {
    carregarDados()
  }, [])

  // Estados dos formulários
  const [nome, setNome] = useState('')
  const [preco, setPreco] = useState('')
  const [categoria, setCategoria] = useState('')
  const [descricao, setDescricao] = useState('')
  const [imagemProduto, setImagemProduto] = useState<File | null>(null)
  const [carregandoProduto, setCarregandoProduto] = useState(false)
  const [gerandoIA, setGerandoIA] = useState(false)

  const [tituloBanner, setTituloBanner] = useState('')
  const [imagemBanner, setImagemBanner] = useState<File | null>(null)
  const [carregandoBanner, setCarregandoBanner] = useState(false)

  const [novaCategoria, setNovaCategoria] = useState('')
  const [carregandoCategoria, setCarregandoCategoria] = useState(false)

  // Funções de Exclusão
  const excluirItem = async (tabela: string, id: number) => {
    if (!confirm(`Tem certeza que deseja excluir este item?`)) return
    const { error } = await supabase.from(tabela).delete().eq('id', id)
    if (error) setMensagem(`Erro ao excluir: ${error.message}`)
    else {
      setMensagem('Item excluído com sucesso!')
      carregarDados()
    }
  }

  // Função IA
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

  // Salvamentos
  const handleSalvarProduto = async (e: React.FormEvent) => {
    e.preventDefault()
    setCarregandoProduto(true)
    const precoNumerico = parseFloat(preco.replace(',', '.'))
    let imagemUrl = ''
    if (imagemProduto) {
      const ext = imagemProduto.name.split('.').pop()
      const nomeArq = `produto_${Math.random()}.${ext}`
      await supabase.storage.from('produtos-imagens').upload(nomeArq, imagemProduto)
      const { data } = supabase.storage.from('produtos-imagens').getPublicUrl(nomeArq)
      imagemUrl = data.publicUrl
    }
    const { error } = await supabase.from('produtos').insert([{ nome, preco: precoNumerico, imagem_url: imagemUrl, categoria, descricao }])
    if (!error) {
      setMensagem('Produto salvo!'); setNome(''); setPreco(''); setDescricao(''); setImagemProduto(null); carregarDados()
    }
    setCarregandoProduto(false)
  }

  const handleSalvarBanner = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imagemBanner) return setMensagem('Selecione uma imagem')
    setCarregandoBanner(true)
    const ext = imagemBanner.name.split('.').pop()
    const nomeArq = `banner_${Math.random()}.${ext}`
    await supabase.storage.from('produtos-imagens').upload(nomeArq, imagemBanner)
    const { data } = supabase.storage.from('produtos-imagens').getPublicUrl(nomeArq)
    const { error } = await supabase.from('banners').insert([{ titulo: tituloBanner, imagem_url: data.publicUrl }])
    if (!error) {
      setMensagem('Banner salvo!'); setTituloBanner(''); setImagemBanner(null); carregarDados()
    }
    setCarregandoBanner(false)
  }

  const handleSalvarCategoria = async (e: React.FormEvent) => {
    e.preventDefault()
    setCarregandoCategoria(true)
    const { error } = await supabase.from('categorias').insert([{ nome: novaCategoria }])
    if (!error) {
      setMensagem('Categoria criada!'); setNovaCategoria(''); carregarDados()
    }
    setCarregandoCategoria(false)
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50 text-gray-900">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        
        <div className="flex border-b border-gray-200 mb-6 text-sm">
          <button onClick={() => { setAbaAtiva('produto'); setMensagem(''); }} className={`flex-1 py-2 font-semibold ${abaAtiva === 'produto' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Produtos</button>
          <button onClick={() => { setAbaAtiva('banner'); setMensagem(''); }} className={`flex-1 py-2 font-semibold ${abaAtiva === 'banner' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Banners</button>
          <button onClick={() => { setAbaAtiva('categoria'); setMensagem(''); }} className={`flex-1 py-2 font-semibold ${abaAtiva === 'categoria' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Categorias</button>
        </div>

        {abaAtiva === 'produto' && (
          <div>
            <form onSubmit={handleSalvarProduto} className="space-y-4 mb-8">
              <div><label className="block text-sm font-medium mb-1">Nome</label><input type="text" required value={nome} onChange={(e) => setNome(e.target.value)} className="w-full p-2 border rounded-md" /></div>
              <div className="flex gap-4">
                <div className="w-1/2"><label className="block text-sm font-medium mb-1">Preço (R$)</label><input type="text" required value={preco} onChange={(e) => setPreco(e.target.value)} className="w-full p-2 border rounded-md" /></div>
                <div className="w-1/2">
                  <label className="block text-sm font-medium mb-1">Categoria</label>
                  <select required value={categoria} onChange={(e) => setCategoria(e.target.value)} className="w-full p-2 border rounded-md bg-white">
                    {categoriasCadastradas.map(cat => <option key={cat.id} value={cat.nome}>{cat.nome}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <label className="block text-sm font-medium">Descrição</label>
                  <button type="button" onClick={gerarDescricaoIA} disabled={gerandoIA || !nome} className="text-xs bg-purple-100 text-purple-700 font-bold px-2 py-1 rounded">✨ Gerar com IA</button>
                </div>
                <textarea rows={3} value={descricao} onChange={(e) => setDescricao(e.target.value)} className="w-full p-2 border rounded-md text-sm" />
              </div>
              <div><label className="block text-sm font-medium mb-1">Foto</label><input type="file" accept="image/*" onChange={(e) => setImagemProduto(e.target.files?.[0] || null)} className="w-full p-2 border rounded-md" /></div>
              <button type="submit" disabled={carregandoProduto} className="w-full bg-blue-600 text-white font-bold py-2 rounded-md">Salvar Produto</button>
            </form>
            
            <h3 className="font-bold border-b pb-2 mb-4">Produtos Cadastrados</h3>
            <ul className="space-y-2">
              {listaProdutos.map(p => (
                <li key={p.id} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                  <span>{p.nome} - R$ {p.preco}</span>
                  <button onClick={() => excluirItem('produtos', p.id)} className="text-red-500 font-bold hover:underline">Excluir</button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {abaAtiva === 'banner' && (
          <div>
            <form onSubmit={handleSalvarBanner} className="space-y-4 mb-8">
              <div><label className="block text-sm mb-1">Título</label><input type="text" required value={tituloBanner} onChange={(e) => setTituloBanner(e.target.value)} className="w-full p-2 border rounded-md" /></div>
              <div><label className="block text-sm mb-1">Imagem</label><input type="file" required accept="image/*" onChange={(e) => setImagemBanner(e.target.files?.[0] || null)} className="w-full p-2 border rounded-md" /></div>
              <button type="submit" disabled={carregandoBanner} className="w-full bg-blue-600 text-white font-bold py-2 rounded-md">Publicar Banner</button>
            </form>

            <h3 className="font-bold border-b pb-2 mb-4">Banners Cadastrados</h3>
            <ul className="space-y-2">
              {listaBanners.map(b => (
                <li key={b.id} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                  <span>{b.titulo}</span>
                  <button onClick={() => excluirItem('banners', b.id)} className="text-red-500 font-bold hover:underline">Excluir</button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {abaAtiva === 'categoria' && (
          <div>
            <form onSubmit={handleSalvarCategoria} className="space-y-4 mb-8">
              <div><label className="block text-sm font-medium mb-1">Nova Categoria</label><input type="text" required value={novaCategoria} onChange={(e) => setNovaCategoria(e.target.value)} className="w-full p-2 border rounded-md" /></div>
              <button type="submit" disabled={carregandoCategoria} className="w-full bg-blue-600 text-white font-bold py-2 rounded-md">Salvar Categoria</button>
            </form>

            <h3 className="font-bold border-b pb-2 mb-4">Categorias Atuais</h3>
            <ul className="space-y-2 text-sm">
              {categoriasCadastradas.map(c => (
                <li key={c.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                  <span>{c.nome}</span>
                  <button onClick={() => excluirItem('categorias', c.id)} className="text-red-500 font-bold hover:underline">Excluir</button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {mensagem && <p className="mt-4 text-center font-medium text-green-600">{mensagem}</p>}
      </div>
    </main>
  )
}