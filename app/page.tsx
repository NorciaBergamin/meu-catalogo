import { supabase } from '@/utils/supabase'

export default async function Home() {
  const { data: produtos } = await supabase.from('produtos').select('*')

  return (
    <main className="min-h-screen p-8 bg-gray-50 text-gray-900">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold">Nosso Catálogo</h1>
        <p className="text-gray-600 mt-2">Confira nossos produtos disponíveis</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {!produtos || produtos.length === 0 ? (
          <p className="text-gray-500 text-center col-span-full mt-10">Nenhum produto cadastrado ainda.</p>
        ) : (
          produtos.map((produto: any) => (
            <div key={produto.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <div className="h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                {produto.imagem_url ? (
                  <img src={produto.imagem_url} alt={produto.nome} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-400">Sem Imagem</span>
                )}
              </div>
              <h2 className="text-lg font-semibold">{produto.nome}</h2>
              <p className="text-green-700 font-bold text-xl mt-2">R$ {produto.preco}</p>
            </div>
          ))
        )}
      </div>
    </main>
  )
}