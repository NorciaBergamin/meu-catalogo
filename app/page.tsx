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
  const [quantidadeModal, setQuantidadeModal] = useState(1) 

  const [carrinho, setCarrinho] = useState<any[]>([])
  const [isCarrinhoAberto, setIsCarrinhoAberto] = useState(false)
  const [listaVendedores, setListaVendedores] = useState<any[]>([])
  const [listaPagamentos, setListaPagamentos] = useState<any[]>([])
  const [finalizando, setFinalizando] = useState(false)

  // Checkout - Campos restantes
  const [vendedorSelecionado, setVendedorSelecionado] = useState('')
  const [formaPagamento, setFormaPagamento] = useState('')

  // Sistema de Login do Cliente
  const [clienteLogado, setClienteLogado] = useState<any>(null)
  const [modalAuthAberto, setModalAuthAberto] = useState(false)
  const [modoAuth, setModoAuth] = useState<'login' | 'cadastro'>('login')
  const [carregandoAuth, setCarregandoAuth] = useState(false)

  // --- NOVO: ÁREA DO CLIENTE ---
  const [modalMeusPedidosAberto, setModalMeusPedidosAberto] = useState(false)
  const [meusPedidos, setMeusPedidos] = useState<any[]>([])
  const [carregandoPedidos, setCarregandoPedidos] = useState(false)

  // Campos de Login e Cadastro
  const [authLogin, setAuthLogin] = useState('')
  const [authSenha, setAuthSenha] = useState('')
  const [cadTipoPessoa, setCadTipoPessoa] = useState('Física')
  const [cadNome, setCadNome] = useState('')
  const [cadCpfCnpj, setCadCpfCnpj] = useState('')
  const [cadTelefone, setCadTelefone] = useState('')
  const [cadCidade, setCadCidade] = useState('')
  const [cadEstado, setCadEstado] = useState('')
  const [cadSenha, setCadSenha] = useState('')

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
      const { data: dadosPag } = await supabase.from('formas_pagamento').select('*').eq('status_ativo', true).order('ordem')
      if (dadosPag) {
        setListaPagamentos(dadosPag)
        if (dadosPag.length > 0) setFormaPagamento(dadosPag[0].titulo)
      }
      setCarregando(false)
    }
    carregarDados()

    const clienteSalvo = localStorage.getItem('erp_cliente_sessao')
    if (clienteSalvo) setClienteLogado(JSON.parse(clienteSalvo))
    const carrinhoSalvo = localStorage.getItem('erp_carrinho_sessao')
    if (carrinhoSalvo) setCarrinho(JSON.parse(carrinhoSalvo))
  }, [])

  useEffect(() => {
    localStorage.setItem('erp_carrinho_sessao', JSON.stringify(carrinho))
  }, [carrinho])

  useEffect(() => {
    if (banners.length === 0) return
    const intervalo = setInterval(() => setBannerAtual((prev) => (prev === banners.length - 1 ? 0 : prev + 1)), 5000)
    return () => clearInterval(intervalo)
  }, [banners.length])

  // --- FUNÇÕES DE AUTENTICAÇÃO E ÁREA DO CLIENTE ---
  const efetuarLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setCarregandoAuth(true)
    const { data } = await supabase.from('pessoas').select('*').eq('tipo', 'cliente').eq('senha', authSenha).or(`telefone.eq.${authLogin},cpf_cnpj.eq.${authLogin}`).single()
    if (data) {
      setClienteLogado(data); localStorage.setItem('erp_cliente_sessao', JSON.stringify(data)); setModalAuthAberto(false)
    } else { alert('Usuário ou senha incorretos.') }
    setCarregandoAuth(false)
  }

  const efetuarCadastro = async (e: React.FormEvent) => {
    e.preventDefault()
    setCarregandoAuth(true)
    const payload = { tipo: 'cliente', tipo_pessoa: cadTipoPessoa, nome: cadNome, cpf_cnpj: cadCpfCnpj, telefone: cadTelefone, cidade: cadCidade, estado: cadEstado, senha: cadSenha, status_ativo: true }
    const { data, error } = await supabase.from('pessoas').insert([payload]).select().single()
    if (error) { alert(`Erro ao criar conta: ${error.message}`) } 
    else { setClienteLogado(data); localStorage.setItem('erp_cliente_sessao', JSON.stringify(data)); setModalAuthAberto(false); alert('Conta criada com sucesso!') }
    setCarregandoAuth(false)
  }

  const fazerLogout = () => { setClienteLogado(null); localStorage.removeItem('erp_cliente_sessao') }

  const abrirMeusPedidos = async () => {
    setModalMeusPedidosAberto(true)
    setCarregandoPedidos(true)
    const { data } = await supabase.from('pedidos').select('*').eq('cliente_id', clienteLogado.id).order('data_pedido', { ascending: false })
    if (data) setMeusPedidos(data)
    setCarregandoPedidos(false)
  }

  // --- FUNÇÕES DO CARRINHO ---
  const adicionarAoCarrinho = (produto: any, quantidadeDesejada: number) => {
    setCarrinho(prev => {
      const existe = prev.find(item => item.produto.id === produto.id)
      if (existe) return prev.map(item => item.produto.id === produto.id ? { ...item, quantidade: item.quantidade + quantidadeDesejada } : item)
      return [...prev, { produto, quantidade: quantidadeDesejada }]
    })
    setProdutoSelecionado(null); setIsCarrinhoAberto(true)
  }

  const alterarQuantidadeItem = (produtoId: number, delta: number) => {
    setCarrinho(prev => prev.map(item => {
      if (item.produto.id === produtoId) { const novaQtd = item.quantidade + delta; return novaQtd > 0 ? { ...item, quantidade: novaQtd } : item }
      return item
    }))
  }

  const removerDoCarrinho = (produtoId: number) => setCarrinho(prev => prev.filter(item => item.produto.id !== produtoId))
  const valorTotalCarrinho = carrinho.reduce((acc, item) => acc + (item.produto.preco * item.quantidade), 0)

  const handleFinalizarCompra = async (e: React.FormEvent) => {
    e.preventDefault()
    if (carrinho.length === 0) return alert('Seu carrinho está vazio.')
    if (!vendedorSelecionado) return alert('Por favor, selecione o vendedor que te atendeu.')

    setFinalizando(true)
    try {
      const { data: pedido, error: erroPed } = await supabase.from('pedidos').insert([{ cliente_id: clienteLogado.id, vendedor_id: parseInt(vendedorSelecionado), valor_total: valorTotalCarrinho, status: 'Pendente', forma_pagamento: formaPagamento }]).select().single()
      if (erroPed) throw erroPed

      const itensBD = carrinho.map(item => ({ pedido_id: pedido.id, produto_nome: item.produto.nome, quantidade: item.quantidade, preco_unitario: item.produto.preco }))
      const { error: erroItens } = await supabase.from('itens_pedido').insert(itensBD)
      if (erroItens) throw erroItens

      const vendedorObj = listaVendedores.find(v => v.id.toString() === vendedorSelecionado)
      const nomeVendedor = vendedorObj ? vendedorObj.nome : 'Não informado'

      // @ts-ignore
      const html2pdf = (await import('html2pdf.js')).default

      const htmlPdf = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h1 style="color: #2563eb; text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">Pedido de Venda #${pedido.id}</h1>
          <div style="display: flex; justify-content: space-between; margin-bottom: 20px; margin-top: 20px;">
            <div style="width: 48%; padding: 15px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px;">
              <h3 style="margin-top: 0; color: #1f2937; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Dados do Cliente</h3>
              <p style="margin: 5px 0;"><strong>Nome:</strong> ${clienteLogado.nome}</p>
              <p style="margin: 5px 0;"><strong>CPF/CNPJ:</strong> ${clienteLogado.cpf_cnpj}</p>
              <p style="margin: 5px 0;"><strong>Localidade:</strong> ${clienteLogado.cidade} - ${clienteLogado.estado}</p>
              <p style="margin: 5px 0;"><strong>Telefone:</strong> ${clienteLogado.telefone}</p>
            </div>
            <div style="width: 48%; padding: 15px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px;">
              <h3 style="margin-top: 0; color: #1f2937; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Dados Comerciais</h3>
              <p style="margin: 5px 0;"><strong>Vendedor:</strong> ${nomeVendedor}</p>
              <p style="margin: 5px 0;"><strong>Pagamento:</strong> ${formaPagamento}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> Aguardando Despacho</p>
            </div>
          </div>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead><tr style="background-color: #2563eb; color: white;"><th style="padding: 12px; text-align: left;">Produto</th><th style="padding: 12px; text-align: center;">Qtd</th><th style="padding: 12px; text-align: right;">V. Unitário</th><th style="padding: 12px; text-align: right;">Subtotal</th></tr></thead>
            <tbody>${carrinho.map(item => `<tr style="border-bottom: 1px solid #e5e7eb;"><td style="padding: 12px;">${item.produto.nome}</td><td style="padding: 12px; text-align: center;">${item.quantidade}</td><td style="padding: 12px; text-align: right;">R$ ${item.produto.preco.toFixed(2)}</td><td style="padding: 12px; text-align: right;">R$ ${(item.produto.preco * item.quantidade).toFixed(2)}</td></tr>`).join('')}</tbody>
          </table>
          <div style="margin-top: 20px; text-align: right; font-size: 18px;"><strong>Total do Pedido: <span style="color: #166534;">R$ ${valorTotalCarrinho.toFixed(2)}</span></strong></div>
        </div>
      `
      const opcoesPdf: any = { margin: 10, filename: `pedido_${pedido.id}_${clienteLogado.nome.replace(/\s+/g, '_')}.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } }
      await html2pdf().set(opcoesPdf).from(htmlPdf).save()

      alert('Pedido finalizado com sucesso! Você pode acompanhar o status na sua Área do Cliente.')
      setCarrinho([]); setIsCarrinhoAberto(false); setVendedorSelecionado('')
    } catch (error: any) { alert(`Erro ao finalizar: ${error.message}`) }
    setFinalizando(false)
  }

  const produtosFiltrados = categoriaAtiva === 'Todos' ? produtos : produtos.filter(p => p.categoria === categoriaAtiva)

  return (
    <main className="min-h-screen pb-12 bg-gray-50 text-gray-900 relative">
      
      {/* CABEÇALHO DO CATÁLOGO COM ÁREA DO CLIENTE */}
      <header className="bg-white border-b border-gray-200 shadow-sm py-4 px-6 flex justify-between items-center sticky top-0 z-30">
        <h1 className="text-2xl font-black text-blue-600 tracking-tighter">CATÁLOGO</h1>
        <div>
          {clienteLogado ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-600 hidden md:inline">Olá, <strong className="text-gray-900">{clienteLogado.nome.split(' ')[0]}</strong></span>
              <button onClick={abrirMeusPedidos} className="text-sm text-blue-600 font-bold hover:underline transition-colors">
                Meus Pedidos
              </button>
              <button onClick={fazerLogout} className="text-xs bg-red-50 text-red-600 font-bold px-3 py-1.5 rounded hover:bg-red-100 transition-colors">Sair</button>
            </div>
          ) : (
            <button onClick={() => setModalAuthAberto(true)} className="text-sm bg-blue-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
              Entrar / Cadastrar
            </button>
          )}
        </div>
      </header>

      {/* BANNERS */}
      {banners.length > 0 && (
        <div className="relative w-full h-[250px] md:h-[400px] bg-gray-900 overflow-hidden">
          {banners.map((banner, index) => (<div key={banner.id} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === bannerAtual ? 'opacity-100' : 'opacity-0'}`}><img src={banner.imagem_url} className="w-full h-full object-cover" /></div>))}
        </div>
      )}

      {/* BOTÃO FLUTUANTE CARRINHO */}
      <button onClick={() => setIsCarrinhoAberto(true)} className="fixed bottom-6 right-6 bg-green-600 text-white p-4 rounded-full shadow-2xl hover:bg-green-700 transition-transform hover:scale-110 z-40 flex items-center gap-2 font-bold">
        🛒 <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full absolute -top-2 -right-2">{carrinho.length}</span>
      </button>

      <div className="text-center mt-12 mb-8"><h2 className="text-3xl font-bold">Nossos Produtos</h2></div>

      <div className="flex flex-wrap justify-center gap-3 mb-10 px-4">
        {listaCategorias.map(cat => (
          <button key={cat} onClick={() => setCategoriaAtiva(cat)} className={`px-4 py-2 rounded-full font-medium transition shadow-sm ${categoriaAtiva === cat ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'}`}>{cat}</button>
        ))}
      </div>

      {carregando ? (<p className="text-center text-gray-500">Carregando...</p>) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto px-4">
          {produtosFiltrados.map((produto) => (
            <div key={produto.id} onClick={() => { setProdutoSelecionado(produto); setQuantidadeModal(1); }} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between hover:shadow-lg transition-shadow cursor-pointer">
              <div>
                <div className="h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden">{produto.imagem_url ? <img src={produto.imagem_url} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" /> : <span>Sem Imagem</span>}</div>
                <h2 className="text-lg font-semibold leading-tight">{produto.nome}</h2>
              </div>
              <p className="text-green-700 font-bold text-xl mt-2">R$ {produto.preco.toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DO PRODUTO */}
      {produtoSelecionado && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row max-h-[90vh]">
            <button onClick={() => setProdutoSelecionado(null)} className="absolute top-3 right-3 bg-gray-200 hover:bg-red-500 hover:text-white rounded-full w-8 h-8 font-bold z-10">✕</button>
            <div className="w-full md:w-1/2 h-64 md:h-auto bg-gray-100 relative">{produtoSelecionado.imagem_url ? <img src={produtoSelecionado.imagem_url} className="w-full h-full object-cover absolute inset-0" /> : <span className="flex h-full items-center justify-center text-gray-400">Sem Imagem</span>}</div>
            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto">
              <div className="flex-1">
                {produtoSelecionado.categoria && <span className="text-xs font-bold text-blue-600 mb-2 block">{produtoSelecionado.categoria}</span>}
                <h2 className="text-3xl font-bold mb-4">{produtoSelecionado.nome}</h2>
                <div className="text-gray-600 mb-6">{produtoSelecionado.descricao ? <p>{produtoSelecionado.descricao}</p> : <p className="italic">Sem descrição.</p>}</div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-green-700 font-bold text-3xl mb-4">R$ {produtoSelecionado.preco.toFixed(2)}</p>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-gray-700 font-medium text-sm">Quantidade:</span>
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <button onClick={() => setQuantidadeModal(prev => Math.max(1, prev - 1))} className="px-4 py-2 bg-gray-100 font-bold">-</button>
                    <span className="px-4 py-2 font-semibold bg-white w-12 text-center">{quantidadeModal}</span>
                    <button onClick={() => setQuantidadeModal(prev => prev + 1)} className="px-4 py-2 bg-gray-100 font-bold">+</button>
                  </div>
                </div>
                <button onClick={() => adicionarAoCarrinho(produtoSelecionado, quantidadeModal)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg">Adicionar ao Carrinho 🛒</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GAVETA DO CARRINHO */}
      {isCarrinhoAberto && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 className="text-2xl font-bold">Seu Carrinho</h2><button onClick={() => setIsCarrinhoAberto(false)} className="text-red-500 font-bold text-xl">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {carrinho.length === 0 ? (<p className="text-center text-gray-500 mt-10">Carrinho vazio.</p>) : (
                <div className="space-y-4">
                  {carrinho.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center border-b pb-4">
                      <div className="flex-1 pr-4">
                        <p className="font-semibold text-gray-800 leading-tight">{item.produto.nome}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center border border-gray-300 rounded-md overflow-hidden h-7">
                            <button onClick={() => alterarQuantidadeItem(item.produto.id, -1)} className="px-2 bg-gray-100 font-bold">-</button><span className="px-3 text-sm font-semibold">{item.quantidade}</span><button onClick={() => alterarQuantidadeItem(item.produto.id, 1)} className="px-2 bg-gray-100 font-bold">+</button>
                          </div>
                          <span className="text-xs text-gray-500">x R$ {item.produto.preco.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2"><p className="font-bold text-green-700">R$ {(item.produto.preco * item.quantidade).toFixed(2)}</p><button onClick={() => removerDoCarrinho(item.produto.id)} className="text-red-500 text-xs bg-red-50 px-2 py-1 rounded">Remover</button></div>
                    </div>
                  ))}
                  <div className="pt-4 text-right border-b pb-6 mb-6"><p className="text-gray-600">Total do Pedido</p><p className="text-3xl font-bold text-green-700">R$ {valorTotalCarrinho.toFixed(2)}</p></div>

                  {!clienteLogado ? (
                    <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl text-center">
                      <p className="text-blue-800 font-medium mb-4">Identifique-se para salvar seu histórico e gerar o pedido.</p>
                      <button onClick={() => { setIsCarrinhoAberto(false); setModalAuthAberto(true); }} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md">
                        Fazer Login ou Cadastrar
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleFinalizarCompra} className="space-y-3 bg-gray-50 p-5 rounded-xl border border-gray-200">
                      <h3 className="font-bold text-gray-800 border-b pb-2 mb-4">Finalizar Compra</h3>
                      <div className="bg-white p-3 rounded border border-gray-200 mb-4 text-sm text-gray-600">
                        <p>Comprando como: <strong className="text-gray-900">{clienteLogado.nome}</strong></p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Forma de Pagamento</label>
                        <select required value={formaPagamento} onChange={e => setFormaPagamento(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md bg-white text-sm">
                          {listaPagamentos.length === 0 ? <option value="Pix">Pix</option> : listaPagamentos.map(p => <option key={p.id} value={p.titulo}>{p.titulo}</option>)}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Vendedor Responsável</label>
                        <select required value={vendedorSelecionado} onChange={e => setVendedorSelecionado(e.target.value)} className="w-full p-2 border border-blue-300 rounded-md bg-white text-sm">
                          <option value="">Selecione quem te atendeu...</option>
                          {listaVendedores.map(v => (<option key={v.id} value={v.id}>{v.nome}</option>))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-2 mt-4">
                        <button type="button" onClick={() => setIsCarrinhoAberto(false)} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-md transition-colors">
                          Continuar Comprando
                        </button>
                        <button type="submit" disabled={finalizando} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-md disabled:opacity-50 transition-colors shadow-md">
                          {finalizando ? 'Processando...' : 'Gerar Pedido e PDF'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: MEUS PEDIDOS (ÁREA DO CLIENTE) */}
      {modalMeusPedidosAberto && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 className="text-2xl font-bold text-gray-800">Meus Pedidos</h2>
              <button onClick={() => setModalMeusPedidosAberto(false)} className="text-gray-400 hover:text-red-500 font-bold text-xl z-10">✕</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
              {carregandoPedidos ? (
                <p className="text-center text-gray-500">Buscando seu histórico...</p>
              ) : meusPedidos.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500 mb-4">Você ainda não realizou nenhum pedido.</p>
                  <button onClick={() => setModalMeusPedidosAberto(false)} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Explorar Produtos</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {meusPedidos.map(pedido => (
                    <div key={pedido.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-black text-lg text-gray-900">#{pedido.id}</span>
                          <span className={`text-xs font-bold px-2 py-1 rounded-full border ${
                            pedido.status === 'Pendente' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            pedido.status === 'Em Produção' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            pedido.status === 'Despachado' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            'bg-green-50 text-green-700 border-green-200'
                          }`}>
                            {pedido.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">Realizado em {new Date(pedido.data_pedido).toLocaleDateString('pt-BR')}</p>
                        <p className="text-sm text-gray-500">Pagamento: {pedido.forma_pagamento || '-'}</p>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-sm text-gray-500 mb-1">Total do Pedido</p>
                        <p className="text-2xl font-bold text-green-700">R$ {Number(pedido.valor_total).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE LOGIN / CADASTRO DO CLIENTE */}
      {modalAuthAberto && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative">
            <button onClick={() => setModalAuthAberto(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 font-bold text-xl z-10">✕</button>
            <div className="flex text-center border-b border-gray-200">
              <button onClick={() => setModoAuth('login')} className={`flex-1 py-4 font-bold ${modoAuth === 'login' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30' : 'text-gray-500 hover:bg-gray-50'}`}>Entrar</button>
              <button onClick={() => setModoAuth('cadastro')} className={`flex-1 py-4 font-bold ${modoAuth === 'cadastro' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30' : 'text-gray-500 hover:bg-gray-50'}`}>Criar Conta</button>
            </div>

            <div className="p-6">
              {modoAuth === 'login' ? (
                <form onSubmit={efetuarLogin} className="space-y-4">
                  <div><label className="block text-sm font-medium mb-1">CPF, CNPJ ou Telefone</label><input type="text" required value={authLogin} onChange={e=>setAuthLogin(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500" placeholder="Ex: 000.000.000-00" /></div>
                  <div><label className="block text-sm font-medium mb-1">Senha</label><input type="password" required value={authSenha} onChange={e=>setAuthSenha(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500" placeholder="••••••••" /></div>
                  <button type="submit" disabled={carregandoAuth} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg mt-2">{carregandoAuth ? 'Aguarde...' : 'Entrar na Conta'}</button>
                </form>
              ) : (
                <form onSubmit={efetuarCadastro} className="space-y-3 max-h-[60vh] overflow-y-auto px-1">
                  <div className="flex gap-2">
                    <div className="w-1/3"><label className="block text-xs font-medium mb-1">Tipo</label><select value={cadTipoPessoa} onChange={e=>setCadTipoPessoa(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md bg-white text-sm"><option>Física</option><option>Jurídica</option></select></div>
                    <div className="w-2/3"><label className="block text-xs font-medium mb-1">CPF / CNPJ</label><input type="text" required value={cadCpfCnpj} onChange={e=>setCadCpfCnpj(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md text-sm" placeholder="000.000.000-00" /></div>
                  </div>
                  <div><label className="block text-xs font-medium mb-1">Nome / Razão Social</label><input type="text" required value={cadNome} onChange={e=>setCadNome(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md text-sm" placeholder="Nome completo" /></div>
                  <div><label className="block text-xs font-medium mb-1">Telefone / WhatsApp</label><input type="text" required value={cadTelefone} onChange={e=>setCadTelefone(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md text-sm" placeholder="(00) 00000-0000" /></div>
                  <div className="flex gap-2">
                    <div className="w-2/3"><label className="block text-xs font-medium mb-1">Cidade</label><input type="text" required value={cadCidade} onChange={e=>setCadCidade(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md text-sm" placeholder="Sua cidade" /></div>
                    <div className="w-1/3"><label className="block text-xs font-medium mb-1">Estado</label><select required value={cadEstado} onChange={e=>setCadEstado(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md bg-white text-sm"><option value="">UF</option><option value="PR">PR</option><option value="SP">SP</option><option value="SC">SC</option><option value="RS">RS</option><option value="MT">MT</option></select></div>
                  </div>
                  <div className="pt-2"><label className="block text-xs font-medium mb-1">Crie uma Senha</label><input type="password" required value={cadSenha} onChange={e=>setCadSenha(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md text-sm" placeholder="Para acessar seus pedidos depois" /></div>
                  <button type="submit" disabled={carregandoAuth} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg mt-4 shadow-sm">{carregandoAuth ? 'Criando Conta...' : 'Cadastrar e Continuar'}</button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}