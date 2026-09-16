'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Image from 'next/image'

export default function Home() {
  const router = useRouter()
  const [produtos, setProdutos] = useState<any[]>([])
  const [banners, setBanners] = useState<any[]>([])
  const [listaCategorias, setListaCategorias] = useState<string[]>([]) 
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos')
  const [carregando, setCarregando] = useState(true)
  const [bannerAtual, setBannerAtual] = useState(0)
  
  const [busca, setBusca] = useState('')
  const [ordenacao, setOrdenacao] = useState('relevancia')

  const [carrinho, setCarrinho] = useState<any[]>([])
  const [isCarrinhoAberto, setIsCarrinhoAberto] = useState(false)
  const [carrinhoCarregado, setCarrinhoCarregado] = useState(false)

  // Estados de Cupom de Desconto
  const [codigoCupom, setCodigoCupom] = useState('')
  const [cupomAplicado, setCupomAplicado] = useState<any>(null)
  const [erroCupom, setErroCupom] = useState('')

  const [listaVendedores, setListaVendedores] = useState<any[]>([])
  const [listaPagamentos, setListaPagamentos] = useState<any[]>([])
  const [finalizando, setFinalizando] = useState(false)

  const [formaPagamento, setFormaPagamento] = useState('')

  const [clienteLogado, setClienteLogado] = useState<any>(null)
  const [modalAuthAberto, setModalAuthAberto] = useState(false)
  const [modoAuth, setModoAuth] = useState<'login' | 'cadastro'>('login')
  const [carregandoAuth, setCarregandoAuth] = useState(false)

  const [modalMeusPedidosAberto, setModalMeusPedidosAberto] = useState(false)
  const [meusPedidos, setMeusPedidos] = useState<any[]>([])
  const [carregandoPedidos, setCarregandoPedidos] = useState(false)
  const [modalInstitucional, setModalInstitucional] = useState<{ titulo: string, conteudo: string } | null>(null)

  const [authLogin, setAuthLogin] = useState('')
  const [authSenha, setAuthSenha] = useState('')
  const [cadTipoPessoa, setCadTipoPessoa] = useState('Física')
  const [cadNome, setCadNome] = useState('')
  const [cadCpfCnpj, setCadCpfCnpj] = useState('')
  const [cadTelefone, setCadTelefone] = useState('')
  const [cadCidade, setCadCidade] = useState('')
  const [cadEstado, setCadEstado] = useState('')
  const [cadSenha, setCadSenha] = useState('')

  // Configurações da Loja
  const [dadosLoja, setDadosLoja] = useState({
    nome: '',
    whatsapp: '',
    logo: '',
    endereco: '',
    cidadeEstado: '',
    cep: '',
    instagram: '',
    facebook: '',
    quemSomos: '',
    duvidasFrequentes: '',
    termosPoliticas: ''
  })

  const filtrosCampanha = ['⭐ Destaques', '🔥 Promoções', '✨ Novidades']

  useEffect(() => {
    async function carregarDados() {
      const { data: dadosProdutos } = await supabase.from('produtos').select('*')
      if (dadosProdutos) setProdutos(dadosProdutos)
      
      const { data: dadosBanners } = await supabase.from('banners').select('*')
      if (dadosBanners) setBanners(dadosBanners)
      
      const { data: dadosCategorias } = await supabase.from('categorias').select('*').order('nome')
      if (dadosCategorias) setListaCategorias(dadosCategorias.map(c => c.nome))

      const { data: dadosVendedores } = await supabase.from('pessoas').select('*').eq('tipo', 'vendedor').order('nome')
      if (dadosVendedores) setListaVendedores(dadosVendedores)
      
      const { data: dadosPag } = await supabase.from('formas_pagamento').select('*').eq('status_ativo', true).order('ordem')
      if (dadosPag) { setListaPagamentos(dadosPag); if (dadosPag.length > 0) setFormaPagamento(dadosPag[0].titulo) }

      const { data: configData } = await supabase.from('configuracoes_loja').select('*').eq('id', 1).single()
      if (configData) {
        setDadosLoja({
          nome: configData.nome || 'CATÁLOGO',
          whatsapp: configData.whatsapp || '',
          logo: configData.logo || '',
          endereco: configData.endereco || '',
          cidadeEstado: configData.cidade_estado || '',
          cep: configData.cep || '',
          instagram: configData.instagram || '',
          facebook: configData.facebook || '',
          quemSomos: configData.quem_somos || '',
          duvidasFrequentes: configData.duvidas_frequentes || '',
          termosPoliticas: configData.termos_politicas || ''
        })
      } else {
        setDadosLoja(prev => ({ ...prev, nome: 'CATÁLOGO' }))
      }
      setCarregando(false)
    }
    carregarDados()

    const clienteSalvo = localStorage.getItem('erp_cliente_sessao')
    if (clienteSalvo) setClienteLogado(JSON.parse(clienteSalvo))
    
    const carrinhoSalvo = localStorage.getItem('erp_carrinho_sessao')
    if (carrinhoSalvo) { setCarrinho(JSON.parse(carrinhoSalvo)) }
    setCarrinhoCarregado(true) 
  }, [])

  useEffect(() => { if (carrinhoCarregado) { localStorage.setItem('erp_carrinho_sessao', JSON.stringify(carrinho)) } }, [carrinho, carrinhoCarregado])
  useEffect(() => { if (banners.length === 0) return; const intervalo = setInterval(() => setBannerAtual((prev) => (prev === banners.length - 1 ? 0 : prev + 1)), 5000); return () => clearInterval(intervalo) }, [banners.length])
  
  // Detecta se veio da página de produto para abrir o carrinho automaticamente
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('abrirCarrinho') === 'true') {
      setIsCarrinhoAberto(true)
      window.history.replaceState({}, '', '/')
    }
  }, [])

  // Captura e salva o vendedor automaticamente caso venha por link de indicação
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const vendedorParam = params.get('vendedor')
    if (vendedorParam) {
      localStorage.setItem('erp_vendedor_indicacao', vendedorParam)
    }
  }, [])

  const efetuarLogin = async (e: React.FormEvent) => { e.preventDefault(); setCarregandoAuth(true); const { data } = await supabase.from('pessoas').select('*').eq('tipo', 'cliente').eq('senha', authSenha).or(`telefone.eq.${authLogin},cpf_cnpj.eq.${authLogin}`).single(); if (data) { setClienteLogado(data); localStorage.setItem('erp_cliente_sessao', JSON.stringify(data)); setModalAuthAberto(false) } else { toast.error('Usuário ou senha incorretos.') }; setCarregandoAuth(false) }
  const efetuarCadastro = async (e: React.FormEvent) => { e.preventDefault(); setCarregandoAuth(true); const payload = { tipo: 'cliente', tipo_pessoa: cadTipoPessoa, nome: cadNome, cpf_cnpj: cadCpfCnpj, telefone: cadTelefone, cidade: cadCidade, estado: cadEstado, senha: cadSenha, status_ativo: true }; const { data, error } = await supabase.from('pessoas').insert([payload]).select().single(); if (error) { toast.error(`Erro: ${error.message}`) } else { setClienteLogado(data); localStorage.setItem('erp_cliente_sessao', JSON.stringify(data)); setModalAuthAberto(false); toast.success('Conta criada com sucesso!') }; setCarregandoAuth(false) }
  const fazerLogout = () => { setClienteLogado(null); localStorage.removeItem('erp_cliente_sessao') }
  const abrirMeusPedidos = async () => { setModalMeusPedidosAberto(true); setCarregandoPedidos(true); const { data } = await supabase.from('pedidos').select('*').eq('cliente_id', clienteLogado.id).order('data_pedido', { ascending: false }); if (data) setMeusPedidos(data); setCarregandoPedidos(false) }
  
  const reimprimirPedidoCliente = async (pedido: any) => {
    try {
      const { data: itens, error } = await supabase.from('itens_pedido').select('*').eq('pedido_id', pedido.id)
      if (error) throw error
      const vendedor = listaVendedores.find(v => v.id === pedido.vendedor_id)
      // @ts-ignore
      const html2pdf = (await import('html2pdf.js')).default
      const htmlPdf = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h1 style="color: #2563eb; text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">Pedido de Venda #${pedido.id} (2ª Via)</h1>
          <div style="display: flex; justify-content: space-between; margin-bottom: 20px; margin-top: 20px;">
            <div style="width: 48%; padding: 15px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px;">
              <h3 style="margin-top: 0; color: #1f2937; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Dados do Cliente</h3>
              <p style="margin: 5px 0;"><strong>Nome:</strong> ${clienteLogado.nome}</p>
              <p style="margin: 5px 0;"><strong>Telefone:</strong> ${clienteLogado.telefone}</p>
            </div>
            <div style="width: 48%; padding: 15px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px;">
              <h3 style="margin-top: 0; color: #1f2937; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Dados Comerciais</h3>
              <p style="margin: 5px 0;"><strong>Vendedor:</strong> ${vendedor?.nome || 'Não informado'}</p>
              <p style="margin: 5px 0;"><strong>Pagamento:</strong> ${pedido.forma_pagamento || '-'}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> ${pedido.status}</p>
            </div>
          </div>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead><tr style="background-color: #2563eb; color: white;"><th style="padding: 12px; text-align: left;">Produto</th><th style="padding: 12px; text-align: center;">Qtd</th><th style="padding: 12px; text-align: right;">V. Unitário</th><th style="padding: 12px; text-align: right;">Subtotal</th></tr></thead>
            <tbody>
              ${itens?.map((item: any) => `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px;">${item.produto_nome}</td><td style="padding: 12px; text-align: center;">${item.quantidade}</td>
                  <td style="padding: 12px; text-align: right;">R$ ${Number(item.preco_unitario).toFixed(2)}</td>
                  <td style="padding: 12px; text-align: right;">R$ ${(Number(item.preco_unitario) * Number(item.quantidade)).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div style="margin-top: 20px; text-align: right; font-size: 18px;">
            <strong>Total do Pedido: <span style="color: #166534;">R$ ${Number(pedido.valor_total).toFixed(2)}</span></strong>
          </div>
        </div>
      `
      const opcoesPdf: any = { margin: 10, filename: `reimpressao_pedido_${pedido.id}.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } }
      await html2pdf().set(opcoesPdf).from(htmlPdf).save()
    } catch (error: any) { toast.error(`Erro ao gerar PDF: ${error.message}`) }
  }

  const alterarQuantidadeItem = (produtoId: number, delta: number) => { 
    setCarrinho(prev => prev.map(item => { 
      if (item.produto.id === produtoId) { 
        const novaQtd = item.quantidade + delta; 
        if (novaQtd > (item.produto.estoque || 0)) { toast.error('Quantidade excede o estoque disponível.'); return item }
        return novaQtd > 0 ? { ...item, quantidade: novaQtd } : item 
      } 
      return item 
    })) 
  }
  const removerDoCarrinho = (produtoId: number) => setCarrinho(prev => prev.filter(item => item.produto.id !== produtoId))
  
  const valorTotalCarrinho = carrinho.reduce((acc, item) => acc + (item.produto.preco * item.quantidade), 0)
  const valorDesconto = cupomAplicado ? valorTotalCarrinho * (Number(cupomAplicado.desconto_percentual) / 100) : 0
  const valorFinalComDesconto = Math.max(0, valorTotalCarrinho - valorDesconto)

  const aplicarCupom = async () => {
    setErroCupom('')
    if (!codigoCupom.trim()) return
    const { data, error } = await supabase.from('cupons').select('*').eq('codigo', codigoCupom.toUpperCase().trim()).eq('ativo', true).single()
    if (error || !data) {
      setErroCupom('Cupom inválido ou expirado.')
      setCupomAplicado(null)
    } else {
      setCupomAplicado(data)
      setErroCupom(`Cupom de ${data.desconto_percentual}% aplicado!`)
    }
  }

  const handleFinalizarCompra = async (e: React.FormEvent) => {
    e.preventDefault()
    if (carrinho.length === 0) return toast.error('Seu carrinho está vazio.')

    const vendedorSalvo = localStorage.getItem('erp_vendedor_indicacao')
    const vendedorIdFinal = vendedorSalvo ? parseInt(vendedorSalvo) : (listaVendedores[0]?.id || 1)

    setFinalizando(true)
    try {
      const { data: pedido, error: erroPed } = await supabase.from('pedidos').insert([{ 
        cliente_id: clienteLogado.id, 
        vendedor_id: vendedorIdFinal, 
        valor_total: valorFinalComDesconto, 
        status: 'Pendente', 
        status_pagamento: 'Aguardando Pagamento',
        forma_pagamento: formaPagamento,
        cupom: cupomAplicado ? `${cupomAplicado.codigo} (${cupomAplicado.desconto_percentual}% off)` : null
      }]).select().single()
      if (erroPed) throw erroPed

      const itensBD = carrinho.map(item => ({ pedido_id: pedido.id, produto_nome: item.produto.nome, quantidade: item.quantidade, preco_unitario: item.produto.preco }))
      await supabase.from('itens_pedido').insert(itensBD)

      for (const item of carrinho) {
        const novoEstoque = Math.max(0, (item.produto.estoque || 0) - item.quantidade)
        await supabase.from('produtos').update({ estoque: novoEstoque }).eq('id', item.produto.id)
      }

      toast.success(`Pedido #${pedido.id} gerado com sucesso e estoque atualizado!`)
      setCarrinho([]); setIsCarrinhoAberto(false); setCupomAplicado(null); setCodigoCupom('')
    } catch (error: any) { toast.error(`Erro ao finalizar: ${error.message}`) }
    setFinalizando(false)
  }

  const handleEnviarWhatsAppApenas = () => {
    if (carrinho.length === 0) return toast.error('Seu carrinho está vazio.')
    if (!dadosLoja.whatsapp) return toast.error('WhatsApp da loja não configurado.')

    const vendedorSalvo = localStorage.getItem('erp_vendedor_indicacao')
    const vendedorObj = listaVendedores.find(v => v.id === Number(vendedorSalvo))
    
    const itensTexto = carrinho.map(i => `• ${i.quantidade}x ${i.produto.nome} (R$ ${(i.produto.preco * i.quantidade).toFixed(2)})`).join('%0A')
    const cupomTexto = cupomAplicado ? `%0A*Cupom Aplicado:* ${cupomAplicado.codigo} (${cupomAplicado.desconto_percentual}% off)` : ''
    const mensagemWp = `*CONSULTA DE PEDIDO*%0A%0A*Cliente:* ${clienteLogado?.nome || 'Cliente'}%0A*Vendedor:* ${vendedorObj?.nome || '-'}%0A*Pagamento:* ${formaPagamento}${cupomTexto}%0A%0A*Itens:*%0A${itensTexto}%0A%0A*Total:* R$ ${valorFinalComDesconto.toFixed(2)}`

    window.open(`https://wa.me/${dadosLoja.whatsapp}?text=${mensagemWp}`, '_blank')
  }

  const produtosFiltrados = produtos.filter(p => {
    let passaCategoria = false
    if (categoriaAtiva === 'Todos') passaCategoria = true
    else if (categoriaAtiva === '⭐ Destaques') passaCategoria = p.is_destaque
    else if (categoriaAtiva === '🔥 Promoções') passaCategoria = p.is_promocao
    else if (categoriaAtiva === '✨ Novidades') passaCategoria = p.is_novo
    else passaCategoria = p.categoria?.trim() === categoriaAtiva?.trim()

    let passaBusca = true
    if (busca.trim() !== '') {
      const termo = busca.toLowerCase()
      passaBusca = p.nome.toLowerCase().includes(termo) || (p.descricao && p.descricao.toLowerCase().includes(termo))
    }
    return passaCategoria && passaBusca
  }).sort((a, b) => {
    if (ordenacao === 'menor-preco') return a.preco - b.preco
    if (ordenacao === 'maior-preco') return b.preco - a.preco
    if (ordenacao === 'alfabetica') return a.nome.localeCompare(b.nome)
    return b.id - a.id
  })

  return (
    <main className="min-h-screen pb-12 bg-gray-50 text-gray-900 relative flex flex-col justify-between">
      <div>
        <header className="bg-white border-b border-gray-100 shadow-sm py-4 px-6 flex justify-between items-center">
          <div onClick={() => window.location.reload()} className="flex items-center gap-3 cursor-pointer" title="Atualizar página">
            {dadosLoja.logo ? <img src={dadosLoja.logo} alt={dadosLoja.nome} className="h-10 object-contain" /> : <h1 className="text-2xl font-black text-blue-600 tracking-tighter">{dadosLoja.nome || '...'}</h1>}
          </div>

          <div className="flex items-center gap-4">
            {dadosLoja.whatsapp && (
              <a href={`https://wa.me/${dadosLoja.whatsapp}?text=Olá,%20gostaria%20de%20atendimento.`} target="_blank" rel="noopener noreferrer" className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-2 shadow-sm hidden sm:flex transition-all">
                💬 WhatsApp
              </a>
            )}
            {clienteLogado ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-600 hidden md:inline">Olá, <strong>{clienteLogado.nome.split(' ')[0]}</strong></span>
                <button onClick={abrirMeusPedidos} className="text-sm text-blue-600 font-bold hover:underline">Meus Pedidos</button>
                <button onClick={fazerLogout} className="text-xs bg-red-50 text-red-600 font-bold px-3 py-1.5 rounded-lg">Sair</button>
              </div>
            ) : (
              <button onClick={() => setModalAuthAberto(true)} className="text-sm bg-blue-600 text-white font-bold px-4 py-2 rounded-xl hover:bg-blue-700 shadow-sm transition-all">Entrar / Cadastrar</button>
            )}
          </div>
        </header>

        {/* BANNERS RESPONSIVOS */}
        {banners.length > 0 && (() => {
          const bannersWeb = banners.filter(b => b.tipo === 'web' || !b.tipo)
          const bannersApp = banners.filter(b => b.tipo === 'app')
          
          const listaWebFinal = bannersWeb.length > 0 ? bannersWeb : banners
          const listaAppFinal = bannersApp.length > 0 ? bannersApp : listaWebFinal

          return (
            <>
              <div className="hidden md:block relative w-full aspect-[3/1] max-h-[480px] bg-white overflow-hidden shadow-sm">
                {listaWebFinal.map((banner, index) => (
                  <div key={banner.id} className={`absolute inset-0 transition-opacity duration-1000 flex items-center justify-center ${index === (bannerAtual % listaWebFinal.length) ? 'opacity-100' : 'opacity-0'}`}>
                    <img src={banner.imagem_url} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>

              <div className="block md:hidden relative w-full aspect-[4/3] max-h-[380px] bg-white overflow-hidden shadow-sm">
                {listaAppFinal.map((banner, index) => (
                  <div key={banner.id} className={`absolute inset-0 transition-opacity duration-1000 flex items-center justify-center ${index === (bannerAtual % listaAppFinal.length) ? 'opacity-100' : 'opacity-0'}`}>
                    <img src={banner.imagem_url} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </>
          )
        })()}

        <button onClick={() => setIsCarrinhoAberto(true)} className="fixed bottom-6 right-6 bg-green-600 text-white p-4 rounded-full shadow-2xl hover:bg-green-700 z-40 flex items-center gap-2 font-bold transition-transform hover:scale-110">
          🛒 <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full absolute -top-2 -right-2">{carrinho.length}</span>
        </button>

        <div className="text-center mt-12 mb-8"><h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Nossos Produtos</h2></div>

        <div className="max-w-[1400px] mx-auto px-4 flex flex-col md:flex-row gap-8">
          
          <aside className="w-full md:w-1/4 lg:w-1/5">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm sticky top-6">
              <h3 className="font-bold text-gray-400 border-b border-gray-100 pb-3 mb-3 uppercase tracking-wider text-xs">Categorias</h3>
              <div className="flex flex-col gap-1">
                <button onClick={() => setCategoriaAtiva('Todos')} className={`text-left px-3 py-2 rounded-xl transition-colors text-sm font-bold ${categoriaAtiva === 'Todos' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}>Todos os Produtos</button>
                {listaCategorias.map(cat => (<button key={cat} onClick={() => setCategoriaAtiva(cat)} className={`text-left px-3 py-2 rounded-xl transition-colors text-sm font-medium ${categoriaAtiva === cat ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}>{cat}</button>))}
              </div>
            </div>
          </aside>

          <div className="w-full md:w-3/4 lg:w-4/5">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <input type="text" placeholder="O que você está procurando?" value={busca} onChange={e => setBusca(e.target.value)} className="w-full p-4 pl-12 rounded-2xl border border-gray-200 shadow-sm outline-none font-medium text-gray-700 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                <span className="absolute left-4 top-4 text-xl opacity-40">🔍</span>
              </div>
              <div className="w-full md:w-64">
                <select value={ordenacao} onChange={e => setOrdenacao(e.target.value)} className="w-full p-4 rounded-2xl border border-gray-200 shadow-sm bg-white font-medium text-gray-700 outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="relevancia">Mais Recentes / Relevância</option>
                  <option value="menor-preco">Menor Preço</option>
                  <option value="maior-preco">Maior Preço</option>
                  <option value="alfabetica">Alfabética (A-Z)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-8">
              {filtrosCampanha.map(cat => {
                let cor = 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                let corAtivo = 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100'
                if (cat === '⭐ Destaques') corAtivo = 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100'
                if (cat === '🔥 Promoções') corAtivo = 'bg-red-600 text-white border-red-600 shadow-md shadow-red-100'
                if (cat === '✨ Novidades') corAtivo = 'bg-green-600 text-white border-green-600 shadow-md shadow-green-100'

                return (
                  <button key={cat} onClick={() => {setCategoriaAtiva(cat); setBusca('')}} className={`px-5 py-2.5 rounded-full font-bold transition-all border text-sm ${categoriaAtiva === cat ? corAtivo : cor}`}>
                    {cat}
                  </button>
                )
              })}
            </div>

            {/* SKELETONS DE CARREGAMENTO / LISTAGEM DE PRODUTOS */}
            {carregando ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <div key={n} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 animate-pulse">
                    <div className="h-52 bg-gray-200 rounded-xl mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-full"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {produtosFiltrados.map((produto) => {
                  const storedVendedor = typeof window !== 'undefined' ? localStorage.getItem('erp_vendedor_indicacao') : null
                  const prodLink = storedVendedor ? `/produto/${produto.id}?vendedor=${storedVendedor}` : `/produto/${produto.id}`
                  return (
                    <div key={produto.id} onClick={() => router.push(prodLink)} className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden group">
                      
                      <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
                        {produto.is_destaque && <span className="bg-blue-600/90 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm backdrop-blur-sm">Destaque</span>}
                        {produto.is_novo && <span className="bg-green-600/90 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm backdrop-blur-sm">Novo</span>}
                        {produto.is_promocao && <span className="bg-red-600/90 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm backdrop-blur-sm">Promoção</span>}
                      </div>

                      <div>
                        <div className="h-56 w-full bg-gray-50 relative overflow-hidden">
                          {produto.imagem_url ? (
                            <Image 
                              src={produto.imagem_url} 
                              alt={produto.nome}
                              fill
                              sizes="(max-width: 768px) 100vw, 300px"
                              className="object-cover group-hover:scale-105 transition-transform duration-500" 
                            />
                          ) : (
                            <span className="text-gray-400 text-sm flex items-center justify-center h-full">Sem Imagem</span>
                          )}
                        </div>
                        <div className="p-4 pb-2">
                          <h2 className="text-base font-semibold text-gray-800 leading-snug line-clamp-2">{produto.nome}</h2>
                        </div>
                      </div>
                      <div className="px-4 pb-4 pt-0">
                        <p className="text-green-600 font-extrabold text-xl">R$ {produto.preco.toFixed(2)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {produtosFiltrados.length === 0 && !carregando && (
              <div className="col-span-full text-center py-12">
                <p className="text-xl font-medium text-gray-700">Nenhum produto encontrado.</p>
                <p className="text-gray-400 mt-2 text-sm">Tente buscar por outro nome ou remova os filtros.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* GAVETA DO CARRINHO */}
      {isCarrinhoAberto && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end backdrop-blur-sm">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">Seu Carrinho</h2>
              <button onClick={() => setIsCarrinhoAberto(false)} className="text-gray-400 hover:text-red-500 font-bold text-xl">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {carrinho.length === 0 ? (<p className="text-center text-gray-400 mt-10">Seu carrinho está vazio.</p>) : (
                <div className="space-y-4">
                  {carrinho.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center border-b border-gray-100 pb-4">
                      <div className="flex-1 pr-4">
                        <p className="font-semibold text-gray-800 leading-tight">{item.produto.nome}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden h-7">
                            <button onClick={() => alterarQuantidadeItem(item.produto.id, -1)} className="px-2 bg-gray-50 font-bold">-</button>
                            <span className="px-3 text-sm font-semibold">{item.quantidade}</span>
                            <button onClick={() => alterarQuantidadeItem(item.produto.id, 1)} className="px-2 bg-gray-50 font-bold">+</button>
                          </div>
                          <span className="text-xs text-gray-400">x R$ {item.produto.preco.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <p className="font-bold text-green-600">R$ {(item.produto.preco * item.quantidade).toFixed(2)}</p>
                        <button onClick={() => removerDoCarrinho(item.produto.id)} className="text-red-500 text-xs bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition-colors">Remover</button>
                      </div>
                    </div>
                  ))}

                  <div className="pt-2 pb-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Cupom de Desconto</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={codigoCupom} 
                        onChange={e => setCodigoCupom(e.target.value)} 
                        placeholder="Ex: PROMO10" 
                        className="flex-1 p-2.5 border border-gray-200 rounded-xl text-sm uppercase outline-none focus:border-blue-500 bg-gray-50 font-bold"
                      />
                      <button type="button" onClick={aplicarCupom} className="bg-gray-900 hover:bg-black text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-colors">
                        Aplicar
                      </button>
                    </div>
                    {erroCupom && <p className={`text-xs mt-1.5 font-bold ${cupomAplicado ? 'text-green-600' : 'text-red-500'}`}>{erroCupom}</p>}
                  </div>

                  <div className="pt-2 text-right border-b border-gray-100 pb-6 mb-6">
                    {cupomAplicado && (
                      <>
                        <p className="text-gray-400 text-xs line-through">Subtotal: R$ {valorTotalCarrinho.toFixed(2)}</p>
                        <p className="text-rose-600 text-xs font-bold">Desconto ({cupomAplicado.desconto_percentual}%): -R$ {valorDesconto.toFixed(2)}</p>
                      </>
                    )}
                    <p className="text-gray-500 text-sm mt-1">Total do Pedido</p>
                    <p className="text-3xl font-extrabold text-green-600">R$ {valorFinalComDesconto.toFixed(2)}</p>
                  </div>

                  {!clienteLogado ? (
                    <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl text-center">
                      <p className="text-blue-900 font-medium mb-4 text-sm">Identifique-se para salvar seu histórico e gerar o pedido.</p>
                      <button onClick={() => { setIsCarrinhoAberto(false); setModalAuthAberto(true); }} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition-all">
                        Fazer Login ou Cadastrar
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleFinalizarCompra} className="space-y-4 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                      <h3 className="font-bold text-gray-800 border-b border-gray-200 pb-2">Finalizar Compra</h3>
                      <div className="bg-white p-3 rounded-xl border border-gray-200 text-sm text-gray-600">
                        <p>Comprando como: <strong className="text-gray-900">{clienteLogado.nome}</strong></p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Forma de Pagamento</label>
                        <select required value={formaPagamento} onChange={e => setFormaPagamento(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-xl bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500">
                          {listaPagamentos.length === 0 ? <option value="Pix">Pix</option> : listaPagamentos.map(p => <option key={p.id} value={p.titulo}>{p.titulo}</option>)}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Vendedor Responsável</label>
                        {(() => {
                          const vendedorSalvo = typeof window !== 'undefined' ? localStorage.getItem('erp_vendedor_indicacao') : null
                          const vendedorObj = listaVendedores.find(v => v.id === Number(vendedorSalvo))
                          return (
                            <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 text-sm text-blue-900">
                              <p>Atendido por: <strong className="text-blue-950">{vendedorObj?.nome || 'Vendedor Oficial da Loja'}</strong></p>
                            </div>
                          )
                        })()}
                      </div>

                      <div className="flex flex-col gap-2 pt-2">
                        <button type="button" onClick={() => setIsCarrinhoAberto(false)} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-xl transition-colors text-sm">
                          Continuar Comprando
                        </button>
                        
                        <button type="submit" disabled={finalizando} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl disabled:opacity-50 transition-all shadow-md text-sm">
                          {finalizando ? 'Processando...' : 'Finalizar Pedido'}
                        </button>

                        <button type="button" onClick={handleEnviarWhatsAppApenas} disabled={finalizando} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl disabled:opacity-50 transition-all shadow-md text-sm flex items-center justify-center gap-2">
                          💬 Enviar Pedido WhatsApp
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

      {/* MODAL MEUS PEDIDOS */}
      {modalMeusPedidosAberto && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">Meus Pedidos</h2>
              <button onClick={() => setModalMeusPedidosAberto(false)} className="text-gray-400 hover:text-red-500 font-bold text-xl">✕</button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
              {carregandoPedidos ? (
                <p className="text-center text-gray-500">Buscando seu histórico...</p>
              ) : meusPedidos.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500 mb-4">Você ainda não realizou nenhum pedido.</p>
                  <button onClick={() => setModalMeusPedidosAberto(false)} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm">Explorar Produtos</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {meusPedidos.map(pedido => (
                    <div key={pedido.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-black text-lg text-gray-900">#{pedido.id}</span>
                          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
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
                      <div className="text-left md:text-right flex flex-col md:items-end gap-3">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Total do Pedido</p>
                          <p className="text-2xl font-extrabold text-green-600">R$ {Number(pedido.valor_total).toFixed(2)}</p>
                        </div>
                        <button onClick={() => reimprimirPedidoCliente(pedido)} className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold py-2 px-4 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 w-full md:w-auto shadow-sm">
                          🖨️ Baixar PDF
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL AUTH (LOGIN / CADASTRO) */}
      {modalAuthAberto && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative">
            <button onClick={() => setModalAuthAberto(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 font-bold text-xl z-10">✕</button>
            <div className="flex text-center border-b border-gray-100">
              <button onClick={() => setModoAuth('login')} className={`flex-1 py-4 font-bold ${modoAuth === 'login' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/20' : 'text-gray-400 hover:bg-gray-50'}`}>Entrar</button>
              <button onClick={() => setModoAuth('cadastro')} className={`flex-1 py-4 font-bold ${modoAuth === 'cadastro' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/20' : 'text-gray-400 hover:bg-gray-50'}`}>Criar Conta</button>
            </div>
            <div className="p-6">
              {modoAuth === 'login' ? (
                <form onSubmit={efetuarLogin} className="space-y-4">
                  <div><label className="block text-sm font-medium mb-1 text-gray-700">CPF, CNPJ ou Telefone</label><input type="text" required value={authLogin} onChange={e=>setAuthLogin(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-sm" placeholder="Ex: 00000000000" /></div>
                  <div><label className="block text-sm font-medium mb-1 text-gray-700">Senha</label><input type="password" required value={authSenha} onChange={e=>setAuthSenha(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-sm" placeholder="••••••••" /></div>
                  <button type="submit" disabled={carregandoAuth} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl mt-2 transition-all shadow-md">{carregandoAuth ? 'Aguarde...' : 'Entrar na Conta'}</button>
                </form>
              ) : (
                <form onSubmit={efetuarCadastro} className="space-y-3 max-h-[60vh] overflow-y-auto px-1">
                  <div className="flex gap-2">
                    <div className="w-1/3"><label className="block text-xs font-medium mb-1 text-gray-700">Tipo</label><select value={cadTipoPessoa} onChange={e=>setCadTipoPessoa(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-xl bg-white text-sm"><option>Física</option><option>Jurídica</option></select></div>
                    <div className="w-2/3"><label className="block text-xs font-medium mb-1 text-gray-700">CPF / CNPJ</label><input type="text" required value={cadCpfCnpj} onChange={e=>setCadCpfCnpj(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-xl text-sm" placeholder="000.000.000-00" /></div>
                  </div>
                  <div><label className="block text-xs font-medium mb-1 text-gray-700">Nome / Razão Social</label><input type="text" required value={cadNome} onChange={e=>setCadNome(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-xl text-sm" placeholder="Nome completo" /></div>
                  <div><label className="block text-xs font-medium mb-1 text-gray-700">Telefone / WhatsApp</label><input type="text" required value={cadTelefone} onChange={e=>setCadTelefone(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-xl text-sm" placeholder="(00) 00000-0000" /></div>
                  <div className="flex gap-2">
                    <div className="w-2/3"><label className="block text-xs font-medium mb-1 text-gray-700">Cidade</label><input type="text" required value={cadCidade} onChange={e=>setCadCidade(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-xl text-sm" placeholder="Sua cidade" /></div>
                    <div className="w-1/3"><label className="block text-xs font-medium mb-1 text-gray-700">Estado</label><select required value={cadEstado} onChange={e=>setCadEstado(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-xl bg-white text-sm"><option value="">UF</option><option value="PR">PR</option><option value="SP">SP</option><option value="SC">SC</option><option value="RS">RS</option><option value="MT">MT</option></select></div>
                  </div>
                  <div className="pt-2"><label className="block text-xs font-medium mb-1 text-gray-700">Crie uma Senha</label><input type="password" required value={cadSenha} onChange={e=>setCadSenha(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-xl text-sm" placeholder="Para acessar seus pedidos depois" /></div>
                  <button type="submit" disabled={carregandoAuth} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl mt-4 shadow-md transition-all">{carregandoAuth ? 'Criando Conta...' : 'Cadastrar e Continuar'}</button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RODAPÉ */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-6 mt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-white font-bold mb-4 tracking-wider text-xs">INSTITUCIONAL</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => setModalInstitucional({ titulo: 'Quem Somos', conteudo: dadosLoja.quemSomos || 'Não cadastrado.' })} className="hover:text-white transition-colors">Quem Somos</button></li>
              <li><button onClick={() => setModalInstitucional({ titulo: 'Dúvidas Frequentes', conteudo: dadosLoja.duvidasFrequentes || 'Não cadastrado.' })} className="hover:text-white transition-colors">Dúvidas Frequentes</button></li>
              <li><button onClick={() => setModalInstitucional({ titulo: 'Termos e Políticas', conteudo: dadosLoja.termosPoliticas || 'Não cadastrado.' })} className="hover:text-white transition-colors">Termos e Políticas</button></li>
            </ul>
          </div>
          <div><h4 className="text-white font-bold mb-4 tracking-wider text-xs">ONDE ESTAMOS</h4><p className="text-sm text-gray-400">{dadosLoja.endereco}</p><p className="text-sm text-gray-400">{dadosLoja.cidadeEstado}</p><p className="text-sm text-gray-400">CEP {dadosLoja.cep}</p></div>
          <div><h4 className="text-white font-bold mb-4 tracking-wider text-xs">REDES SOCIAIS</h4><div className="flex space-x-4 text-sm">{dadosLoja.instagram && <a href={dadosLoja.instagram} target="_blank" className="hover:text-white transition-colors">Instagram</a>}{dadosLoja.facebook && <a href={dadosLoja.facebook} target="_blank" className="hover:text-white transition-colors">Facebook</a>}</div></div>
          <div><h4 className="text-white font-bold mb-4 tracking-wider text-xs">SEGURANÇA</h4><div className="bg-white/10 p-3 rounded-xl text-white font-bold text-xs inline-block border border-white/10">🔒 SECURE SITE</div></div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-gray-800 text-center text-xs text-gray-500">© {new Date().getFullYear()} {dadosLoja.nome} - Todos os direitos reservados.</div>
      </footer>

      {/* MODAL INSTITUCIONAL */}
      {modalInstitucional && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative max-h-[85vh] flex flex-col text-gray-900">
            <div className="flex justify-between items-center border-b pb-4 mb-4"><h3 className="text-2xl font-bold">{modalInstitucional.titulo}</h3><button onClick={() => setModalInstitucional(null)} className="text-xl font-bold">✕</button></div>
            <div className="overflow-y-auto flex-1 text-sm leading-relaxed whitespace-pre-wrap">{modalInstitucional.conteudo}</div>
          </div>
        </div>
      )}
    </main>
  )
}