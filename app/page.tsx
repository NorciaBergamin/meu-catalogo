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

  useEffect(() => {
    async function carregarDados() {
      // 1. Busca os produtos
      const { data: dadosProdutos } = await supabase.from('produtos').select('*')
      if (dadosProdutos) setProdutos(dadosProdutos)

      // 2. Busca os banners
      const { data: dadosBanners } = await supabase.from('banners').select('*')
      if (dadosBanners) setBanners(dadosBanners)

      // 3. Busca as categorias reais e adiciona na lista de botões
      const { data: dadosCategorias } = await supabase.from('categorias').select('*').order('nome')
      if (dadosCategorias) {
        const nomes = dadosCategorias.map((c: any) => c.nome)
        setListaCategorias(['Todos', ...nomes])
      }
      
      setCarregando(false)
    }
    carregarDados()
  }, [])

  // Rotação automática dos banners
  useEffect(() => {
    if (banners.length === 0) return
    const intervalo = setInterval(() => {
      setBannerAtual((prev) => (prev === banners.length - 1 ? 0 : prev + 1))
    }, 5000)
    return () => clearInterval(intervalo)
  }, [banners.length])

  // Filtra os produtos com base no botão clicado
  const produtosFiltrados = categoriaAtiva === 'Todos' 
    ? produtos 
    : produtos.filter(p => p.categoria === categoriaAtiva)

  return (
    <main className="min-h-screen pb-12 bg-gray-50 text-gray-900">
      
      {/* Seção de Banners Rotativos - Só exibe se houver banners */}
      {banners.length > 0 && (
        <div className="relative w-full h-[300px] md:h-[450px] bg-gray-900 overflow-hidden shadow-md">
          {banners.map((banner, index) => (
            <div 
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === bannerAtual ? 'opacity-100' : 'opacity-0'}`}
            >
              <img 
                src={banner.imagem_url} 
                alt={banner.titulo} 
                className="w-full h-full object-cover opacity-50"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <h2 className="text-4xl md:text-6xl font-bold text-white tracking-wider shadow-black drop-shadow-xl uppercase text-center px-4">
                  {banner.titulo}
                </h2>
              </div>
            </div>
          ))}

          {/* Bolinhas de navegação do banner */}
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

      {/* Botões de Filtro Dinâmicos */}
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
              <div key={produto.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between hover:shadow-lg transition-shadow">
                <div>
                  <div className="h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                    {produto.imagem_url ? (
                      <img src={produto.imagem_url} alt={produto.nome} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-400">Sem Imagem</span>
                    )}
                  </div>
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-lg font-semibold leading-tight">{produto.nome}</h2>
                    {produto.categoria && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full whitespace-nowrap ml-2 border border-gray-200">
                        {produto.categoria}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-green-700 font-bold text-xl mt-2">R$ {produto.preco}</p>
              </div>
            ))
          )}
        </div>
      )}
    </main>
  )
}