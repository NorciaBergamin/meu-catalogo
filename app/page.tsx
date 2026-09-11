'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'

export default function Home() {
  const [produtos, setProdutos] = useState<any[]>([])
  const [banners, setBanners] = useState<any[]>([])
  const [listaCategorias, setListaCategorias] = useState<string[]>(['Todos'])
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos')
  const [carregando, setCarregando] = useState(true)
  const [bannerAtual, setBannerAtual] = useState(0)

  // Estado para controlar a janela flutuante (modal) do produto
  const [produtoSelecionado, setProdutoSelecionado] = useState<any>(null)

  useEffect(() => {
    async function carregarDados() {
      const { data: dadosProdutos } = await supabase.from('produtos').select('*')
      if (dadosProdutos) setProdutos(dadosProdutos)

      const { data: dadosBanners } = await supabase.from('banners').select('*')
      if (dadosBanners) setBanners(dadosBanners)

      const { data: dadosCategorias } = await supabase.from('categorias').select('*').order('nome')
      if (dadosCategorias) {
        const nomes = dadosCategorias.map((c: any) => c.nome)
        setListaCategorias(['Todos', ...nomes])
      }
      
      setCarregando(false)
    }
    carregarDados()
  }, [])

  useEffect(() => {
    if (banners.length === 0) return
    const intervalo = setInterval(() => {
      setBannerAtual((prev) => (prev === banners.length - 1 ? 0 : prev + 1))
    }, 5000)
    return () => clearInterval(intervalo)
  }, [banners.length])

  const produtosFiltrados = categoriaAtiva === 'Todos' 
    ? produtos 
    : produtos.filter(p => p.categoria === categoriaAtiva)

  return (
    <main className="min-h-screen pb-12 bg-gray-50 text-gray-900">
      
      {banners.length > 0 && (
        <div className="relative w-full h-[300px] md:h-[450px] bg-gray-900 overflow-hidden shadow-md">
          {banners.map((banner, index) => (
            <div 
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === bannerAtual ? 'opacity-100' : 'opacity-0'}`}
            >
              {/* Removido o filtro escuro (opacity) e o texto por cima */}
              <img 
                src={banner.imagem_url} 
                alt={banner.titulo} 
                className="w-full h-full object-cover"
              />
            </div>
          ))}

          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3">
            {banners.map((_, index) => (
              <button 
                key={index}
                onClick={() => setBannerAtual(index)}
                className={`w-3 h-3 rounded-full transition-all shadow-md ${index === bannerAtual ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'}`}
              />
            ))}
          </div>
        </div>
      )}

      <header className="text-center mt-12 mb-10">
        <h1 className="text-4xl font-bold">Nosso Catálogo</h1>
        <p className="text-gray-600 mt-2">Confira nossos produtos disponíveis</p>
      </header>

      <div className="flex flex-wrap justify-center gap-3 mb-10 px-4">
        {listaCategorias.map(cat => (
          <button 
            key={cat}
            onClick={() => setCategoriaAtiva(cat)}
            className={`px-4 py-2 rounded-full font-medium transition shadow-sm ${
              categoriaAtiva === cat 
                ? 'bg-blue-600 text-white' 
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {carregando ? (
        <p className="text-center text-gray-500">Carregando catálogo...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto px-4">
          {produtosFiltrados.length === 0 ? (
            <p className="text-gray-500 text-center col-span-full mt-10">
              Nenhum produto encontrado nesta categoria.
            </p>
          ) : (
            produtosFiltrados.map((produto) => (
              <div 
                key={produto.id} 
                onClick={() => setProdutoSelecionado(produto)} 
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div>
                  <div className="h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                    {produto.imagem_url ? (
                      <img src={produto.imagem_url} alt={produto.nome} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <span className="text-gray-400">Sem Imagem</span>
                    )}
                  </div>
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-lg font-semibold leading-tight">{produto.nome}</h2>
                  </div>
                </div>
                <p className="text-green-700 font-bold text-xl mt-2">R$ {produto.preco}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* JANELA FLUTUANTE DO PRODUTO (MODAL) */}
      {produtoSelecionado && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row max-h-[90vh]">
            
            <button 
              onClick={() => setProdutoSelecionado(null)}
              className="absolute top-3 right-3 bg-gray-200 hover:bg-red-500 hover:text-white transition-colors text-gray-800 rounded-full w-8 h-8 flex items-center justify-center font-bold z-10"
            >
              ✕
            </button>
            
            <div className="w-full md:w-1/2 h-64 md:h-auto bg-gray-100 flex items-center justify-center relative">
              {produtoSelecionado.imagem_url ? (
                <img src={produtoSelecionado.imagem_url} alt={produtoSelecionado.nome} className="w-full h-full object-cover absolute inset-0" />
              ) : (
                <span className="text-gray-400">Sem Imagem</span>
              )}
            </div>

            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto">
              <div className="flex-1">
                {produtoSelecionado.categoria && (
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2 block">
                    {produtoSelecionado.categoria}
                  </span>
                )}
                <h2 className="text-3xl font-bold mb-4 text-gray-900 leading-tight">{produtoSelecionado.nome}</h2>
                
                <div className="text-gray-600 mb-6 leading-relaxed">
                  {produtoSelecionado.descricao ? (
                    <p>{produtoSelecionado.descricao}</p>
                  ) : (
                    <p className="italic">Nenhuma descrição cadastrada para este produto.</p>
                  )}
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Preço à vista</p>
                <p className="text-green-700 font-bold text-4xl">R$ {produtoSelecionado.preco}</p>
                
                {/* Botão extra para simular um pedido via WhatsApp se você quiser depois */}
                <button 
                  onClick={() => alert('Função de carrinho/WhatsApp pode ser colocada aqui!')} 
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg mt-6 transition-colors"
                >
                  Tenho Interesse
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </main>
  )
}