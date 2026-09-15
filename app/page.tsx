'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'

export default function Home() {
  const [produtos, setProdutos] = useState<any[]>([])
  const [banners, setBanners] = useState<any[]>([])
  const [listaCategorias, setListaCategorias] = useState<string[]>([]) 
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos')
  const [carregando, setCarregando] = useState(true)
  const [bannerAtual, setBannerAtual] = useState(0)
  
  const [busca, setBusca] = useState('')
  const [ordenacao, setOrdenacao] = useState('relevancia')

  const [produtoSelecionado, setProdutoSelecionado] = useState<any>(null)
  const [quantidadeModal, setQuantidadeModal] = useState(1) 

  const [carrinho, setCarrinho] = useState<any[]>([])
  const [isCarrinhoAberto, setIsCarrinhoAberto] = useState(false)
  const [carrinhoCarregado, setCarrinhoCarregado] = useState(false)

  const [listaVendedores, setListaVendedores] = useState<any[]>([])
  const [listaPagamentos, setListaPagamentos] = useState<any[]>([])
  const [finalizando, setFinalizando] = useState(false)

  const [vendedorSelecionado, setVendedorSelecionado] = useState('')
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

  const [dadosLoja, setDadosLoja] = useState({
    nome: 'CATÁLOGO',
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

  const efetuarLogin = async (e: React.FormEvent) => { e.preventDefault(); setCarregandoAuth(true); const { data } = await supabase.from('pessoas').select('*').eq('tipo', 'cliente').eq('senha', authSenha).or(`telefone.eq.${authLogin},cpf_cnpj.eq.${authLogin}`).single(); if (data) { setClienteLogado(data); localStorage.setItem('erp_cliente_sessao', JSON.stringify(data)); setModalAuthAberto(false) } else { alert('Usuário ou senha incorretos.') }; setCarregandoAuth(false) }
  const efetuarCadastro = async (e: React.FormEvent) => { e.preventDefault(); setCarregandoAuth(true); const payload = { tipo: 'cliente', tipo_pessoa: cadTipoPessoa, nome: cadNome, cpf_cnpj: cadCpfCnpj, telefone: cadTelefone, cidade: cadCidade, estado: cadEstado, senha: cadSenha, status_ativo: true }; const { data, error } = await supabase.from('pessoas').insert([payload]).select().single(); if (error) { alert(`Erro: ${error.message}`) } else { setClienteLogado(data); localStorage.setItem('erp_cliente_sessao', JSON.stringify(data)); setModalAuthAberto(false); alert('Conta criada com sucesso!') }; setCarregandoAuth(false) }
  const fazerLogout = () => { setClienteLogado(null); localStorage.removeItem('erp_cliente_sessao') }
  const abrirMeusPedidos = async () => { setModalMeusPedidosAberto(true); setCarregandoPedidos(true); const { data } = await supabase.from('pedidos').select('*').eq('cliente_id', clienteLogado.id).order('data_pedido', { ascending: false }); if (data) setMeusPedidos(data); setCarregandoPedidos(false) }
  
  const adicionarAoCarrinho = (produto: any, quantidadeDesejada: number) => { 
    if ((produto.estoque || 0) < quantidadeDesejada) return alert(`Desculpe, temos apenas ${produto.estoque || 0} unidades em estoque.`)
    setCarrinho(prev => { 
      const existe = prev.find(item => item.produto.id === produto.id)
      if (existe) {
        const novaQtd = existe.quantidade + quantidadeDesejada
        if ((produto.estoque || 0) < novaQtd) { alert(`Estoque insuficiente. Máximo disponível: ${produto.estoque}`); return prev }
        return prev.map(item => item.produto.id === produto.id ? { ...item, quantidade: novaQtd } : item)
      } 
      return [...prev, { produto, quantidade: quantidadeDesejada }] 
    })
    setProdutoSelecionado(null); setIsCarrinhoAberto(true) 
  }

  const alterarQuantidadeItem = (produtoId: number, delta: number) => { 
    setCarrinho(prev => prev.map(item => { 
      if (item.produto.id === produtoId) { 
        const novaQtd = item.quantidade + delta; 
        if (novaQtd > (item.produto.estoque || 0)) { alert('Quantidade excede o estoque disponível.'); return item }
        return novaQtd > 0 ? { ...item, quantidade: novaQtd } : item 
      } 
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
      await supabase.from('itens_pedido').insert(itensBD)

      for (const item of carrinho) {
        const novoEstoque = Math.max(0, (item.produto.estoque || 0) - item.quantidade)
        await supabase.from('produtos').update({ estoque: novoEstoque }).eq('id', item.produto.id)
      }

      const vendedorObj = listaVendedores.find(v => v.id === parseInt(vendedorSelecionado))
      const itensTexto = carrinho.map(i => `• ${i.quantidade}x ${i.produto.nome} (R$ ${(i.produto.preco * i.quantidade).toFixed(2)})`).join('%0A')
      const mensagemWp = `*NOVO PEDIDO #${pedido.id}*%0A%0A*Cliente:* ${clienteLogado.nome}%0A*Vendedor:* ${vendedorObj?.nome || '-'}%0A*Pagamento:* ${formaPagamento}%0A%0A*Itens:*%0A${itensTexto}%0A%0A*Total:* R$ ${valorTotalCarrinho.toFixed(2)}`

      alert('Pedido finalizado com sucesso e estoque atualizado!')
      setCarrinho([]); setIsCarrinhoAberto(false); setVendedorSelecionado('')

      if (dadosLoja.whatsapp) {
        window.open(`https://wa.me/${dadosLoja.whatsapp}?text=${mensagemWp}`, '_blank')
      }
    } catch (error: any) { alert(`Erro ao finalizar: ${error.message}`) }
    setFinalizando(false)
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
            {dadosLoja.logo ? <img src={dadosLoja.logo} alt={dadosLoja.nome} className="h-10 object-contain" /> : <h1 className="text-2xl font-black text-blue-600 tracking-tighter">{dadosLoja.nome}</h1>}
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

        {banners.length > 0 && (
          <div className="relative w-full h-[250px] md:h-[400px] bg-gray-900 overflow-hidden shadow-inner">
            {banners.map((banner, index) => (<div key={banner.id} className={`absolute inset-0 transition-opacity duration-1000 ${index === bannerAtual ? 'opacity-100' : 'opacity-0'}`}><img src={banner.imagem_url} className="w-full h-full object-cover" /></div>))}
          </div>
        )}

        <button onClick={() => setIsCarrinhoAberto(true)} className="fixed bottom-6 right-6 bg-green-600 text-white p-4 rounded-full shadow-2xl hover:bg-green-700 z-40 flex items-center gap-2 font-bold transition-transform hover:scale-110">
          🛒 <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full absolute -top-2 -right-2">{carrinho.length}</span>
        </button>

        <div className="text-center mt-12 mb-8"><h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Nossos Produtos</h2></div>

        <div className="max-w-[1400px] mx-auto px-4 flex flex-col md:flex-row gap-8">
          
          {/* CATEGORIAS (Design suave e limpo) */}
          <aside className="w-full md:w-1/4 lg:w-1/5">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm sticky top-6">
              <h3 className="font-bold text-gray-400 border-b border-gray-100 pb-3 mb-3 uppercase tracking-wider text-xs">Categorias</h3>
              <div className="flex flex-col gap-1">
                <button onClick={() => setCategoriaAtiva('Todos')} className={`text-left px-3 py-2 rounded-xl transition-colors text-sm font-bold ${categoriaAtiva === 'Todos' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}>Todos os Produtos</button>
                {listaCategorias.map(cat => (<button key={cat} onClick={() => setCategoriaAtiva(cat)} className={`text-left px-3 py-2 rounded-xl transition-colors text-sm font-medium ${categoriaAtiva === cat ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}>{cat}</button>))}
              </div>
            </div>
          </aside>

          {/* BUSCA + ORDENAÇÃO + VITRINE */}
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

            {carregando ? (<p className="text-center text-gray-500">Carregando...</p>) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {produtosFiltrados.map((produto) => (
                  <div key={produto.id} onClick={() => { setProdutoSelecionado(produto); setQuantidadeModal(1); }} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden group">
                    
                    <div className="absolute top-6 left-6 flex flex-col gap-1.5 z-10">
                      {produto.is_destaque && <span className="bg-blue-600/90 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm backdrop-blur-sm">Destaque</span>}
                      {produto.is_novo && <span className="bg-green-600/90 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm backdrop-blur-sm">Novo</span>}
                      {produto.is_promocao && <span className="bg-red-600/90 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm backdrop-blur-sm">Promoção</span>}
                    </div>

                    <div>
                      <div className="h-52 bg-gray-50 rounded-xl mb-4 flex items-center justify-center overflow-hidden border border-gray-50">
                        {produto.imagem_url ? <img src={produto.imagem_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <span className="text-gray-400 text-sm">Sem Imagem</span>}
                      </div>
                      <h2 className="text-base font-semibold text-gray-800 leading-snug line-clamp-2">{produto.nome}</h2>
                    </div>
                    <div className="mt-4 pt-2">
                      <p className="text-green-600 font-extrabold text-xl">R$ {produto.preco.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
                {produtosFiltrados.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <p className="text-xl font-medium text-gray-700">Nenhum produto encontrado.</p>
                    <p className="text-gray-400 mt-2 text-sm">Tente buscar por outro nome ou remova os filtros.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

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