'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DetalheProduto() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id

  const [produto, setProduto] = useState<any>(null)
  const [produtosRelacionados, setProdutosRelacionados] = useState<any[]>([])
  const [carregando, setCarregando] = useState(true)
  const [quantidade, setQuantidade] = useState(1)
  const [fotoAtivaIndex, setFotoAtivaIndex] = useState(0)
  const [dadosLoja, setDadosLoja] = useState({ nome: '', whatsapp: '', logo: '' })

  useEffect(() => {
    async function carregarProduto() {
      if (!id) return
      setCarregando(true)
      setFotoAtivaIndex(0)
      
      const { data, error } = await supabase.from('produtos').select('*').eq('id', id).single()
      if (data) {
        setProduto(data)
        
        // Buscar produtos relacionados da mesma categoria (excluindo o atual)
        if (data.categoria) {
          const { data: relacionados } = await supabase
            .from('produtos')
            .select('*')
            .eq('categoria', data.categoria)
            .neq('id', data.id)
            .limit(4)
          
          if (relacionados) setProdutosRelacionados(relacionados)
        }
      }
      
      const { data: configData } = await supabase.from('configuracoes_loja').select('*').eq('id', 1).single()
      if (configData) setDadosLoja({ nome: configData.nome || 'Loja', whatsapp: configData.whatsapp || '', logo: configData.logo || '' })
      
      setCarregando(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    carregarProduto()
  }, [id])

  if (carregando) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500 font-medium">Carregando produto...</div>
  }

  if (!produto) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="text-xl font-bold text-gray-800 mb-4">Produto não encontrado.</p>
        <Link href="/" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold">Voltar ao Catálogo</Link>
      </div>
    )
  }

  const fotos = [
    produto.imagem_url,
    produto.imagem_url_2,
    produto.imagem_url_3,
    produto.imagem_url_4,
    produto.imagem_url_5
  ].filter(Boolean)

  const fotoAtual = fotos[fotoAtivaIndex] || produto.imagem_url

  const adicionarAoCarrinhoGlobal = () => {
    if ((produto.estoque || 0) < quantidade) return alert(`Desculpe, temos apenas ${produto.estoque || 0} unidades em estoque.`)
    const carrinhoAtual = JSON.parse(localStorage.getItem('erp_carrinho_sessao') || '[]')
    const existe = carrinhoAtual.find((item: any) => item.produto.id === produto.id)
    
    let novoCarrinho
    if (existe) {
      novoCarrinho = carrinhoAtual.map((item: any) => item.produto.id === produto.id ? { ...item, quantidade: item.quantidade + quantidade } : item)
    } else {
      novoCarrinho = [...carrinhoAtual, { produto, quantidade }]
    }
    localStorage.setItem('erp_carrinho_sessao', JSON.stringify(novoCarrinho))
    
    // Redireciona para a home enviando o parâmetro para abrir o carrinho automaticamente
    router.push('/?abrirCarrinho=true')
  }

  return (
    <main className="min-h-screen bg-white text-gray-900 pb-20">
      <header className="border-b border-gray-100 py-4 px-6 md:px-12 flex justify-between items-center max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-3">
          {dadosLoja.logo ? <img src={dadosLoja.logo} alt={dadosLoja.nome} className="h-10 object-contain" /> : <h1 className="text-2xl font-black text-blue-600 tracking-tighter">{dadosLoja.nome}</h1>}
        </Link>
        <Link href="/" className="text-sm font-bold text-blue-600 hover:underline">← Voltar para a Loja</Link>
      </header>

      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-6">
        <div className="text-xs text-gray-400 mb-8 flex items-center gap-2">
          <Link href="/" className="hover:text-blue-600">🏠 Início</Link>
          <span>/</span>
          <span>{produto.categoria || 'Geral'}</span>
          <span>/</span>
          <span className="text-gray-700 font-semibold">{produto.nome}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7 flex flex-col md:flex-row gap-4">
            {fotos.length > 1 && (
              <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-[500px]">
                {fotos.map((f, i) => (
                  <button key={i} onClick={() => setFotoAtivaIndex(i)} className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all bg-white flex-shrink-0 ${fotoAtivaIndex === i ? 'border-blue-600 shadow-md scale-105' : 'border-gray-200 opacity-60 hover:opacity-100'}`}>
                    <img src={f} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="flex-1 bg-gray-50 rounded-3xl border border-gray-100 p-6 flex items-center justify-center min-h-[420px] md:min-h-[500px] relative overflow-hidden shadow-sm">
              {produto.is_destaque && <span className="absolute top-6 left-6 bg-blue-600 text-white text-xs font-black uppercase tracking-wider px-3 py-1 rounded-lg shadow-sm">Destaque</span>}
              {fotoAtual ? <img src={fotoAtual} className="max-h-[450px] w-full object-contain" /> : <span className="text-gray-400">Sem Imagem</span>}
            </div>
          </div>

          <div className="lg:col-span-5 bg-gray-50/50 p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Cód. {produto.id}</span>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight mb-6">{produto.nome}</h1>
              
              <div className="border-t border-b border-gray-200/60 py-6 my-6">
                <span className="text-xs text-gray-400 block mb-1">Preço à vista</span>
                <p className="text-4xl font-black text-green-700 tracking-tight">R$ {produto.preco.toFixed(2)}</p>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-medium text-gray-700">Quantidade:</span>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                  <button onClick={() => setQuantidade(prev => Math.max(1, prev - 1))} className="px-4 py-2.5 bg-gray-50 font-bold hover:bg-gray-100 transition-colors">-</button>
                  <span className="px-5 py-2.5 font-bold text-gray-800 w-12 text-center">{quantidade}</span>
                  <button onClick={() => setQuantidade(prev => prev + 1)} className="px-4 py-2.5 bg-gray-50 font-bold hover:bg-gray-100 transition-colors">+</button>
                </div>
              </div>
            </div>

            <button onClick={adicionarAoCarrinhoGlobal} className="w-full bg-[#0d47a1] hover:bg-[#0b3c8c] text-white font-black py-4 px-6 rounded-2xl shadow-lg transition-all text-base uppercase tracking-wider flex items-center justify-center gap-2">
              🛒 Adicionar ao Carrinho
            </button>
          </div>
        </div>

        {/* Descrição e Especificações */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-gray-100 pt-12">
          <div>
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-3 mb-4">Descrição</h3>
            <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
              {produto.descricao ? produto.descricao : <p className="italic text-gray-400">Nenhuma descrição informada para este produto.</p>}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-3 mb-4">Especificações</h3>
            <div className="text-gray-600 text-sm space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="font-semibold text-gray-700">Categoria</span>
                <span>{produto.categoria || 'Geral'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="font-semibold text-gray-700">Disponibilidade</span>
                <span className="text-green-600 font-bold">{produto.estoque > 0 ? `${produto.estoque} unidades em estoque` : 'Sob Consulta'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* PRODUTOS RELACIONADOS */}
        {produtosRelacionados.length > 0 && (
          <div className="mt-24 border-t border-gray-100 pt-16">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl md:text-2xl font-black text-gray-900 uppercase tracking-tight">Produtos Relacionados</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {produtosRelacionados.map((item) => (
                <div key={item.id} onClick={() => router.push(`/produto/${item.id}`)} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden group">
                  <div>
                    <div className="h-52 bg-gray-50 rounded-xl mb-4 flex items-center justify-center overflow-hidden border border-gray-50">
                      {item.imagem_url ? <img src={item.imagem_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <span className="text-gray-400 text-sm">Sem Imagem</span>}
                    </div>
                    <h4 className="text-base font-semibold text-gray-800 leading-snug line-clamp-2">{item.nome}</h4>
                  </div>
                  <div className="mt-4 pt-2">
                    <p className="text-green-600 font-extrabold text-xl">R$ {item.preco.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  )
}