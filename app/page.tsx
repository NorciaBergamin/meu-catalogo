'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'

export default function Home() {
  const [produtos, setProdutos] = useState<any[]>([])
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos')
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function carregarProdutos() {
      const { data } = await supabase.from('produtos').select('*')
      if (data) setProdutos(data)
      setCarregando(false)
    }
    carregarProdutos()
  }, [])

  const categorias = ['Todos', 'Churrasco', 'Instrumentos', 'Aquarismo', 'Outros']
  
  const produtosFiltrados = categoriaAtiva === 'Todos' 
    ? produtos 
    : produtos.filter(p => p.categoria === categoriaAtiva)

  return (
    <main className="min-h-screen p-8 bg-gray-50 text-gray-900">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold">Nosso Catálogo</h1>
        <p className="text-gray-600 mt-2">Confira nossos produtos disponíveis</p>
      </header>

      {/* Botões de Filtro */}
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {categorias.map(cat => (
          <button 
            key={cat}
            onClick={() => setCategoriaAtiva(cat)}
            className={`px-4 py-2 rounded-full font-medium transition ${
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {produtosFiltrados.length === 0 ? (
            <p className="text-gray-500 text-center col-span-full mt-10">
              Nenhum produto encontrado nesta categoria.
            </p>
          ) : (
            produtosFiltrados.map((produto) => (
              <div key={produto.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between">
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
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full whitespace-nowrap ml-2">
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