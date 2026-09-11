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
  const [produtoSelecionado, setProdutoSelecionado] = useState<any>(null)

  const [carrinho, setCarrinho] = useState<any[]>([])
  const [isCarrinhoAberto, setIsCarrinhoAberto] = useState(false)
  const [listaVendedores, setListaVendedores] = useState<any[]>([])
  const [nomeCliente, setNomeCliente] = useState('')
  const [telefoneCliente, setTelefoneCliente] = useState('')
  const [vendedorSelecionado, setVendedorSelecionado] = useState('')
  const [finalizando, setFinalizando] = useState(false)

  useEffect(() => {
    async function carregarDados() {
      const { data: dadosProdutos } = await supabase.from('produtos').select('*')
      if (dadosProdutos) setProdutos(dadosProdutos)

      const { data: dadosBanners } = await supabase.from('banners').select('*')
      if (dadosBanners) setBanners(dadosBanners)

      const { data: dadosCategorias } = await supabase.from('categorias').select('*').order('nome')
      if (dadosCategorias) setListaCategorias(['Todos', ...dadosCategorias.map(c => c.nome)])

      const { data: dadosVendedores } = await supabase.from('pessoas').select('*').eq('tipo', 'vendedor').order('nome')
      if (dadosVendedores) setListaVendedores(dadosVendedores)
      
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

  const adicionarAoCarrinho = (produto: any) => {
    setCarrinho(prev => {
      const existe = prev.find(item => item.produto.id === produto.id)
      if (existe) {
        return prev.map(item => item.produto.id === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item)
      }
      return [...prev, { produto, quantidade: 1 }]
    })
    setProdutoSelecionado(null)
    setIsCarrinhoAberto(true)
  }

  const removerDoCarrinho = (produtoId: number) => {
    setCarrinho(prev => prev.filter(item => item.produto.id !== produtoId))
  }

  const valorTotalCarrinho = carrinho.reduce((acc, item) => acc + (item.produto.preco * item.quantidade), 0)

  const handleFinalizarCompra = async (e: React.FormEvent) => {
    e.preventDefault()
    if (carrinho.length === 0) return alert('Seu carrinho está vazio.')
    if (!vendedorSelecionado) return alert('Por favor, selecione um vendedor.')

    setFinalizando(true)
    try {
      // 1. Cadastra o Cliente
      const { data: cliente, error: erroCli } = await supabase
        .from('pessoas')
        .insert([{ nome: nomeCliente, telefone: telefoneCliente, tipo: 'cliente' }])
        .select()
        .single()
      if (erroCli) throw erroCli

      // 2. Cria o Pedido
      const { data: pedido, error: erroPed } = await supabase
        .from('pedidos')
        .insert([{ cliente_id: cliente.id, vendedor_id: parseInt(vendedorSelecionado), valor_total: valorTotalCarrinho, status: 'Pendente' }])
        .select()
        .single()
      if (erroPed) throw erroPed

      // 3. Salva os Itens
      const itensBD = carrinho.map(item => ({
        pedido_id: pedido.id,
        produto_nome: item.produto.nome,
        quantidade: item.quantidade,
        preco_unitario: item.produto.preco
      }))
      const { error: erroItens } = await supabase.from('itens_pedido').insert(itensBD)
      if (erroItens) throw erroItens

      // 4. PREPARAR E GERAR O PDF
      const vendedorObj = listaVendedores.find(v => v.id.toString() === vendedorSelecionado)
      const nomeVendedor = vendedorObj ? vendedorObj.nome : 'Não informado'

      // Import dinâmico da biblioteca de PDF
      // @ts-ignore
      const html2pdf = (await import('html2pdf.js')).default

      const htmlPdf = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h1 style="color: #2563eb; text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">Pedido de Venda #${pedido.id}</h1>
          
          <div style="display: flex; justify-content: space-between; margin-bottom: 20px; margin-top: 20px;">
            <div style="width: 48%; padding: 15px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px;">
              <h3 style="margin-top: 0; color: #1f2937; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Dados do Cliente</h3>
              <p style="margin: 5px 0;"><strong>Nome:</strong> ${nomeCliente}</p>
              <p style="margin: 5px 0;"><strong>Telefone:</strong> ${telefoneCliente}</p>
            </div>
            <div style="width: 48%; padding: 15px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px;">
              <h3 style="margin-top: 0; color: #1f2937; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Dados do Vendedor</h3>
              <p style="margin: 5px 0;"><strong>Responsável:</strong> ${nomeVendedor}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> Aguardando Despacho</p>
            </div>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr style="background-color: #2563eb; color: white;">
                <th style="padding: 12px; text-align: left;">Produto</th>
                <th style="padding: 12px; text-align: center;">Qtd</th>
                <th style="padding: 12px; text-align: right;">V. Unitário</th>
                <th style="padding: 12px; text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${carrinho.map(item => `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px;">${item.produto.nome}</td>
                  <td style="padding: 12px; text-align: center;">${item.quantidade}</td>
                  <td style="padding: 12px; text-align: right;">R$ ${item.produto.preco.toFixed(2)}</td>
                  <td style="padding: 12px; text-align: right;">R$ ${(item.produto.preco * item.quantidade).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="margin-top: 20px; text-align: right; font-size: 18px;">
            <strong>Total do Pedido: <span style="color: #166534;">R$ ${valorTotalCarrinho.toFixed(2)}</span></strong>
          </div>
          
          <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #9ca3af;">
            Este documento foi gerado automaticamente pelo Catálogo Online.
          </div>
        </div>
      `

      const opcoesPdf: any = {
        margin: 10,
        filename: `pedido_${pedido.id}_${nomeCliente.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }

      await html2pdf().set(opcoesPdf).from(htmlPdf).save()

      alert('Pedido finalizado! O download do comprovante em PDF começará automaticamente.')
      setCarrinho([])
      setIsCarrinhoAberto(false)
      setNomeCliente('')
      setTelefoneCliente('')
      setVendedorSelecionado('')
    } catch (error: any) {
      alert(`Erro ao finalizar: ${error.message}`)
    }
    setFinalizando(false)
  }

  const produtosFiltrados = categoriaAtiva === 'Todos' 
    ? produtos 
    : produtos.filter(p => p.categoria === categoriaAtiva)

  return (
    <main className="min-h-screen pb-12 bg-gray-50 text-gray-900 relative">
      
      {banners.length > 0 && (
        <div className="relative w-full h-[300px] md:h-[450px] bg-gray-900 overflow-hidden shadow-md">
          {banners.map((banner, index) => (
            <div key={banner.id} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === bannerAtual ? 'opacity-100' : 'opacity-0'}`}>
              <img src={banner.imagem_url} alt={banner.titulo} className="w-full h-full object-cover" />
            </div>
          ))}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3">
            {banners.map((_, index) => (
              <button key={index} onClick={() => setBannerAtual(index)} className={`w-3 h-3 rounded-full transition-all shadow-md ${index === bannerAtual ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'}`} />
            ))}
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsCarrinhoAberto(true)}
        className="fixed bottom-6 right-6 bg-green-600 text-white p-4 rounded-full shadow-2xl hover:bg-green-700 transition-transform hover:scale-110 z-40 flex items-center gap-2 font-bold"
      >
        🛒 <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full absolute -top-2 -right-2">{carrinho.length}</span>
      </button>

      <header className="text-center mt-12 mb-10">
        <h1 className="text-4xl font-bold">Nosso Catálogo</h1>
        <p className="text-gray-600 mt-2">Confira nossos produtos disponíveis</p>
      </header>

      <div className="flex flex-wrap justify-center gap-3 mb-10 px-4">
        {listaCategorias.map(cat => (
          <button key={cat} onClick={() => setCategoriaAtiva(cat)} className={`px-4 py-2 rounded-full font-medium transition shadow-sm ${categoriaAtiva === cat ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'}`}>
            {cat}
          </button>
        ))}
      </div>

      {carregando ? (
        <p className="text-center text-gray-500">Carregando catálogo...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto px-4">
          {produtosFiltrados.length === 0 ? (
            <p className="text-gray-500 text-center col-span-full mt-10">Nenhum produto encontrado nesta categoria.</p>
          ) : (
            produtosFiltrados.map((produto) => (
              <div key={produto.id} onClick={() => setProdutoSelecionado(produto)} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between hover:shadow-lg transition-shadow cursor-pointer">
                <div>
                  <div className="h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                    {produto.imagem_url ? <img src={produto.imagem_url} alt={produto.nome} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" /> : <span className="text-gray-400">Sem Imagem</span>}
                  </div>
                  <h2 className="text-lg font-semibold leading-tight">{produto.nome}</h2>
                </div>
                <p className="text-green-700 font-bold text-xl mt-2">R$ {produto.preco.toFixed(2)}</p>
              </div>
            ))
          )}
        </div>
      )}

      {produtoSelecionado && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row max-h-[90vh]">
            <button onClick={() => setProdutoSelecionado(null)} className="absolute top-3 right-3 bg-gray-200 hover:bg-red-500 hover:text-white rounded-full w-8 h-8 flex items-center justify-center font-bold z-10">✕</button>
            <div className="w-full md:w-1/2 h-64 md:h-auto bg-gray-100 relative">
              {produtoSelecionado.imagem_url ? <img src={produtoSelecionado.imagem_url} alt={produtoSelecionado.nome} className="w-full h-full object-cover absolute inset-0" /> : <span className="flex h-full items-center justify-center text-gray-400">Sem Imagem</span>}
            </div>
            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto">
              <div className="flex-1">
                {produtoSelecionado.categoria && <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2 block">{produtoSelecionado.categoria}</span>}
                <h2 className="text-3xl font-bold mb-4">{produtoSelecionado.nome}</h2>
                <div className="text-gray-600 mb-6">{produtoSelecionado.descricao ? <p>{produtoSelecionado.descricao}</p> : <p className="italic">Sem descrição.</p>}</div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Preço unitário</p>
                <p className="text-green-700 font-bold text-4xl">R$ {produtoSelecionado.preco.toFixed(2)}</p>
                <button onClick={() => adicionarAoCarrinho(produtoSelecionado)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg mt-6 transition-colors shadow-lg">
                  Adicionar ao Carrinho 🛒
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isCarrinhoAberto && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-slide-in-right">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 className="text-2xl font-bold">Seu Carrinho</h2>
              <button onClick={() => setIsCarrinhoAberto(false)} className="text-gray-500 hover:text-red-500 font-bold text-xl">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {carrinho.length === 0 ? (
                <p className="text-center text-gray-500 mt-10">O carrinho está vazio.</p>
              ) : (
                <div className="space-y-4">
                  {carrinho.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center border-b pb-4">
                      <div>
                        <p className="font-semibold">{item.produto.nome}</p>
                        <p className="text-sm text-gray-500">Qtd: {item.quantidade} x R$ {item.produto.preco.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-bold text-green-700">R$ {(item.produto.preco * item.quantidade).toFixed(2)}</p>
                        <button onClick={() => removerDoCarrinho(item.produto.id)} className="text-red-500 text-xs hover:underline">Remover</button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-4 text-right border-b pb-6 mb-6">
                    <p className="text-gray-600">Total do Pedido</p>
                    <p className="text-3xl font-bold text-green-700">R$ {valorTotalCarrinho.toFixed(2)}</p>
                  </div>

                  <form onSubmit={handleFinalizarCompra} className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <h3 className="font-bold text-gray-800 mb-2">Finalizar Pedido</h3>
                    <div>
                      <label className="block text-xs font-medium mb-1">Seu Nome Completo</label>
                      <input type="text" required value={nomeCliente} onChange={e => setNomeCliente(e.target.value)} className="w-full p-2 border rounded-md text-sm" placeholder="Ex: João Silva" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Seu Telefone / WhatsApp</label>
                      <input type="text" required value={telefoneCliente} onChange={e => setTelefoneCliente(e.target.value)} className="w-full p-2 border rounded-md text-sm" placeholder="(00) 00000-0000" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Vendedor que te atendeu</label>
                      <select required value={vendedorSelecionado} onChange={e => setVendedorSelecionado(e.target.value)} className="w-full p-2 border rounded-md text-sm bg-white">
                        <option value="">Selecione um vendedor...</option>
                        {listaVendedores.map(v => (
                          <option key={v.id} value={v.id}>{v.nome}</option>
                        ))}
                      </select>
                    </div>
                    <button type="submit" disabled={finalizando} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-md mt-4 disabled:opacity-50">
                      {finalizando ? 'Processando Recibo...' : 'Confirmar e Gerar PDF'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </main>
  )
}