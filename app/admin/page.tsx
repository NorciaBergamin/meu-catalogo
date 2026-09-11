'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'
import { GoogleGenAI } from '@google/genai'

export default function AdminPanel() {
  const [abaAtiva, setAbaAtiva] = useState('produto')
  const [mensagem, setMensagem] = useState('')
  
  // Listagens do Banco
  const [categoriasCadastradas, setCategoriasCadastradas] = useState<any[]>([])
  const [listaProdutos, setListaProdutos] = useState<any[]>([])
  const [listaBanners, setListaBanners] = useState<any[]>([])
  const [listaVendedores, setListaVendedores] = useState<any[]>([]) // Novo estado

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

    // Busca os vendedores na tabela pessoas
    const { data: vend } = await supabase.from('pessoas').select('*').eq('tipo', 'vendedor').order('nome')
    if (vend) setListaVendedores(vend)
  }

  useEffect(() => {
    carregarDados()
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

  // Estados Vendedor (Novo)
  const [nomeVendedor, setNomeVendedor] = useState('')
  const [telefoneVendedor, setTelefoneVendedor] = useState('')
  const [carregandoVendedor, setCarregandoVendedor] = useState(false)

  // Exclusão Universal
  const excluirItem = async (tabela: string, id: number) => {
    if (!confirm(`Tem certeza que deseja excluir este item?`)) return
    const { error } = await supabase.from(tabela).delete().eq('id', id)
    if (error) setMensagem(`Erro ao excluir: ${error.message}`)
    else {
      setMensagem('Item excluído com sucesso!')
      carregarDados()
    }
  }

  // IA
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

  // Funções de Salvamento
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

  // Novo Salvamento: Vendedor
  const handleSalvarVendedor = async (e: React.FormEvent) => {
    e.preventDefault()
    setCarregandoVendedor(true)
    const { error } = await supabase.from('pessoas').insert([{ nome: nomeVendedor, telefone: telefoneVendedor, tipo: 'vendedor' }])
    if (!error) {
      setMensagem('Vendedor cadastrado com sucesso!')
      setNomeVendedor('')
      setTelefoneVendedor('')
      carregarDados()
    } else {
      setMensagem(`Erro: ${error.message}`)
    }
    setCarregandoVendedor(false)
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50 text-gray-900">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        
        {/* Menu de Abas */}
        <div className="flex flex-wrap border-b border-gray-200 mb-6 text-sm">
          <button onClick={() => { setAbaAtiva('produto'); setMensagem(''); }} className={`flex-1 py-2 font-semibold min-w-[100px] ${abaAtiva === 'produto' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Produtos</button>
          <button onClick={() => { setAbaAtiva('banner'); setMensagem(''); }} className={`flex-1 py-2 font-semibold min-w-[100px] ${abaAtiva === 'banner' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Banners</button>
          <button onClick={() => { setAbaAtiva('categoria'); setMensagem(''); }} className={`flex-1 py-2 font-semibold min-w-[100px] ${abaAtiva === 'categoria' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Categorias</button>
          <button onClick={() => { setAbaAtiva('vendedor'); setMensagem(''); }} className={`flex-1 py-2 font-semibold min-w-[100px] ${abaAtiva === 'vendedor' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500'}`}>Vendedores</button>
        </div>

        {/* Formulários Existentes Omitidos Visualmente (Eles continuam no código abaixo) */}
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

        {/* NOVA ABA: VENDEDORES */}
        {abaAtiva === 'vendedor' && (
          <div>
            <form onSubmit={handleSalvarVendedor} className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-medium mb-1">Nome do Vendedor</label>
                <input type="text" required value={nomeVendedor} onChange={(e) => setNomeVendedor(e.target.value)} className="w-full p-2 border rounded-md" placeholder="Ex: João (Matriz)" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Telefone / WhatsApp</label>
                <input type="text" required value={telefoneVendedor} onChange={(e) => setTelefoneVendedor(e.target.value)} className="w-full p-2 border rounded-md" placeholder="(00) 00000-0000" />
              </div>
              <button type="submit" disabled={carregandoVendedor} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-md transition-colors">
                Cadastrar Vendedor
              </button>
            </form>

            <h3 className="font-bold border-b pb-2 mb-4">Equipe de Vendas</h3>
            <ul className="space-y-2 text-sm">
              {listaVendedores.map(v => (
                <li key={v.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                  <span><strong>{v.nome}</strong> - {v.telefone}</span>
                  <button onClick={() => excluirItem('pessoas', v.id)} className="text-red-500 font-bold hover:underline">Excluir</button>
                </li>
              ))}
              {listaVendedores.length === 0 && <p className="text-gray-500 italic">Nenhum vendedor cadastrado ainda.</p>}
            </ul>
          </div>
        )}

        {mensagem && <p className="mt-4 text-center font-medium text-green-600">{mensagem}</p>}
      </div>
    </main>
  )
}