'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'
import { gerarDescricaoAcao } from './actions'

export default function AdminPanel() {
  const [usuarioLogado, setUsuarioLogado] = useState<any>(null)
  const [loginUser, setLoginUser] = useState('')
  const [loginSenha, setLoginSenha] = useState('')
  const [erroLogin, setErroLogin] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErroLogin('')
    if (loginUser.toLowerCase() === 'admin' && loginSenha === 'admin123') {
      setUsuarioLogado({ tipo: 'admin', nome: 'Administrador' })
      setAbaAtiva('pedidos')
      return
    }
    const { data } = await supabase.from('pessoas').select('*').eq('tipo', 'vendedor').eq('senha', loginSenha).or(`telefone.eq.${loginUser},nome.eq.${loginUser}`).single()
    if (data) {
      setUsuarioLogado(data)
      setAbaAtiva('pedidos')
    } else {
      setErroLogin('Usuário ou senha incorretos.')
    }
  }

  const [abaAtiva, setAbaAtiva] = useState('pedidos')
  const [mensagem, setMensagem] = useState('')
  
  const [categoriasCadastradas, setCategoriasCadastradas] = useState<any[]>([])
  const [listaProdutos, setListaProdutos] = useState<any[]>([])
  const [listaBanners, setListaBanners] = useState<any[]>([])
  const [listaVendedores, setListaVendedores] = useState<any[]>([])
  const [listaClientes, setListaClientes] = useState<any[]>([])
  const [listaPedidos, setListaPedidos] = useState<any[]>([])
  const [listaPagamentos, setListaPagamentos] = useState<any[]>([])
  const [desbloqueados, setDesbloqueados] = useState<number[]>([])

  // Dados da Loja (Supabase)
  const [dadosLoja, setDadosLoja] = useState({
    nome: '', whatsapp: '', logo: '', endereco: '', cidadeEstado: '', cep: '', instagram: '', facebook: '', quemSomos: '', duvidasFrequentes: '', termosPoliticas: ''
  })
  const [logoArquivo, setLogoArquivo] = useState<File | null>(null)
  const [carregandoLogo, setCarregandoLogo] = useState(false)

  // Estados Produto (com controle de visibilidade do form e filtros)
  const [mostrarFormProd, setMostrarFormProd] = useState(false)
  const [mostrarFiltrosProd, setMostrarFiltrosProd] = useState(false)
  const [filtroProdNome, setFiltroProdNome] = useState('')
  const [filtroProdCat, setFiltroProdCat] = useState('')
  const [idProdutoEdicao, setIdProdutoEdicao] = useState<number | null>(null)
  const [nome, setNome] = useState(''); const [preco, setPreco] = useState(''); const [estoque, setEstoque] = useState('0'); const [categoria, setCategoria] = useState(''); const [descricao, setDescricao] = useState(''); const [imagemProduto, setImagemProduto] = useState<File | null>(null); const [carregandoProduto, setCarregandoProduto] = useState(false); const [gerandoIA, setGerandoIA] = useState(false)
  const [isDestaque, setIsDestaque] = useState(false)
  const [isNovo, setIsNovo] = useState(false)
  const [isPromocao, setIsPromocao] = useState(false)

  // Estados Banners e Categorias
  const [tituloBanner, setTituloBanner] = useState(''); const [imagemBanner, setImagemBanner] = useState<File | null>(null); const [carregandoBanner, setCarregandoBanner] = useState(false)
  const [novaCategoria, setNovaCategoria] = useState(''); const [carregandoCategoria, setCarregandoCategoria] = useState(false)

  // Estados Vendedor
  const [nomeVendedor, setNomeVendedor] = useState(''); const [telefoneVendedor, setTelefoneVendedor] = useState(''); const [comissaoVendedor, setComissaoVendedor] = useState(''); const [senhaVendedor, setSenhaVendedor] = useState(''); const [idVendedorEdicao, setIdVendedorEdicao] = useState<number | null>(null); const [carregandoVendedor, setCarregandoVendedor] = useState(false)

  // Estados Pagamentos
  const [idPagamentoEdicao, setIdPagamentoEdicao] = useState<number | null>(null)
  const [pagTitulo, setPagTitulo] = useState(''); const [pagDescricao, setPagDescricao] = useState(''); const [pagValorMinimo, setPagValorMinimo] = useState(''); const [pagOrdem, setPagOrdem] = useState('1'); const [pagStatusAtivo, setPagStatusAtivo] = useState(true); const [carregandoPagamento, setCarregandoPagamento] = useState(false)

  // Clientes CRM
  const [mostrarFiltrosCli, setMostrarFiltrosCli] = useState(false)
  const [mostrarFormCli, setMostrarFormCli] = useState(false)
  const [idCliEdicao, setIdCliEdicao] = useState<number | null>(null)
  const [cliTipoPessoa, setCliTipoPessoa] = useState('Jurídica')
  const [cliRazao, setCliRazao] = useState('')
  const [cliFantasia, setCliFantasia] = useState('')
  const [cliCpfCnpj, setCliCpfCnpj] = useState('')
  const [cliTelefone, setCliTelefone] = useState('')
  const [cliCidade, setCliCidade] = useState('')
  const [cliEstado, setCliEstado] = useState('')
  const [cliRepresentante, setCliRepresentante] = useState('')
  const [cliStatusAtivo, setCliStatusAtivo] = useState(true)
  const [cliSenha, setCliSenha] = useState('')
  const [filtroCliNome, setFiltroCliNome] = useState('')
  const [filtroCliCpf, setFiltroCliCpf] = useState('')
  const [filtroCliRep, setFiltroCliRep] = useState('')
  const [filtroCliCidade, setFiltroCliCidade] = useState('')
  const [filtroCliEstado, setFiltroCliEstado] = useState('')
  const [filtroCliStatus, setFiltroCliStatus] = useState('')

  // Gestão de Pedidos (Filtros)
  const [mostrarFiltrosPed, setMostrarFiltrosPed] = useState(false)
  const [filtroPedId, setFiltroPedId] = useState('')
  const [filtroPedStatus, setFiltroPedStatus] = useState('')

  async function carregarDados() {
    if (!usuarioLogado) return
    const { data: cat } = await supabase.from('categorias').select('*').order('nome'); if (cat) { setCategoriasCadastradas(cat); if (cat.length > 0 && !categoria) setCategoria(cat[0].nome) }
    const { data: prod } = await supabase.from('produtos').select('*').order('id', { ascending: false }); if (prod) setListaProdutos(prod)
    const { data: ban } = await supabase.from('banners').select('*').order('id', { ascending: false }); if (ban) setListaBanners(ban)
    const { data: vend } = await supabase.from('pessoas').select('*').eq('tipo', 'vendedor').order('nome'); if (vend) setListaVendedores(usuarioLogado.tipo === 'admin' ? vend : vend.filter(v => v.id === usuarioLogado.id))
    const { data: cli } = await supabase.from('pessoas').select('*').eq('tipo', 'cliente').order('id', { ascending: false }); if (cli) setListaClientes(usuarioLogado.tipo === 'admin' ? cli : cli.filter(c => c.representante_id === usuarioLogado.id))
    const { data: ped } = await supabase.from('pedidos').select('*').order('id', { ascending: false }); if (ped) setListaPedidos(usuarioLogado.tipo === 'admin' ? ped : ped.filter(p => p.vendedor_id === usuarioLogado.id))
    const { data: pag } = await supabase.from('formas_pagamento').select('*').order('ordem', { ascending: true }); if (pag) setListaPagamentos(pag)

    const { data: configData } = await supabase.from('configuracoes_loja').select('*').eq('id', 1).single()
    if (configData) {
      setDadosLoja({
        nome: configData.nome || '', whatsapp: configData.whatsapp || '', logo: configData.logo || '',
        endereco: configData.endereco || '', cidadeEstado: configData.cidade_estado || '', cep: configData.cep || '',
        instagram: configData.instagram || '', facebook: configData.facebook || '', quemSomos: configData.quem_somos || '',
        duvidasFrequentes: configData.duvidas_frequentes || '', termosPoliticas: configData.termos_politicas || ''
      })
    }
  }

  useEffect(() => { carregarDados() }, [usuarioLogado])

  const salvarConfigLoja = async (e: React.FormEvent) => {
    e.preventDefault(); setCarregandoLogo(true); setMensagem('Salvando configurações...')
    let novaLogoUrl = dadosLoja.logo
    if (logoArquivo) {
      const ext = logoArquivo.name.split('.').pop()
      const nomeArq = `logo_${Math.random()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('produtos-imagens').upload(nomeArq, logoArquivo)
      if (uploadError) { alert(`Erro: ${uploadError.message}`); setCarregandoLogo(false); return }
      const { data } = supabase.storage.from('produtos-imagens').getPublicUrl(nomeArq)
      novaLogoUrl = data.publicUrl
    }
    const payload = {
      nome: dadosLoja.nome, whatsapp: dadosLoja.whatsapp, logo: novaLogoUrl, endereco: dadosLoja.endereco,
      cidade_estado: dadosLoja.cidadeEstado, cep: dadosLoja.cep, instagram: dadosLoja.instagram, facebook: dadosLoja.facebook,
      quem_somos: dadosLoja.quemSomos, duvidas_frequentes: dadosLoja.duvidasFrequentes, termos_politicas: dadosLoja.termosPoliticas
    }
    const { error } = await supabase.from('configuracoes_loja').update(payload).eq('id', 1)
    if (!error) { setDadosLoja(prev => ({ ...prev, logo: novaLogoUrl })); setMensagem('✅ Configurações salvas!') }
    else { setMensagem(`❌ Erro: ${error.message}`) }
    setCarregandoLogo(false); setLogoArquivo(null)
  }

  const excluirItem = async (tabela: string, id: number) => {
    if (!confirm(`Tem certeza que deseja excluir este item?`)) return
    const { error } = await supabase.from(tabela).delete().eq('id', id)
    if (!error) { setMensagem('Item excluído!'); carregarDados() }
  }

  // Produtos & Relatórios PDF/CSV
  const limparFormProd = () => { setIdProdutoEdicao(null); setNome(''); setPreco(''); setEstoque('0'); setDescricao(''); setImagemProduto(null); setIsDestaque(false); setIsNovo(false); setIsPromocao(false) }
  const iniciarEdicaoProduto = (p: any) => { 
    setIdProdutoEdicao(p.id); setNome(p.nome); setPreco(p.preco.toString()); setEstoque((p.estoque || 0).toString())
    const catValida = categoriasCadastradas.find(c => c.nome === p.categoria)
    setCategoria(catValida ? p.categoria : (categoriasCadastradas.length > 0 ? categoriasCadastradas[0].nome : ''))
    setDescricao(p.descricao || ''); setImagemProduto(null); setIsDestaque(p.is_destaque || false); setIsNovo(p.is_novo || false); setIsPromocao(p.is_promocao || false)
    setMostrarFormProd(true); setMostrarFiltrosProd(false); window.scrollTo({ top: 0, behavior: 'smooth' }) 
  }
  const handleSalvarProduto = async (e: React.FormEvent) => {
    e.preventDefault(); setCarregandoProduto(true)
    const precoNumerico = parseFloat(preco.replace(',', '.'))
    const estoqueNumerico = parseInt(estoque) || 0
    let imagemUrl = ''
    if (imagemProduto) { 
      const ext = imagemProduto.name.split('.').pop()
      const nomeArq = `produto_${Math.random()}.${ext}`
      await supabase.storage.from('produtos-imagens').upload(nomeArq, imagemProduto)
      const { data } = supabase.storage.from('produtos-imagens').getPublicUrl(nomeArq)
      imagemUrl = data.publicUrl 
    }
    const payload: any = { nome, preco: precoNumerico, estoque: estoqueNumerico, categoria, descricao, is_destaque: isDestaque, is_novo: isNovo, is_promocao: isPromocao }
    if (imagemUrl) payload.imagem_url = imagemUrl

    if (idProdutoEdicao) {
      await supabase.from('produtos').update(payload).eq('id', idProdutoEdicao)
      setMensagem('Produto atualizado!')
    } else {
      await supabase.from('produtos').insert([payload])
      setMensagem('Produto salvo!')
    }
    limparFormProd(); setMostrarFormProd(false); carregarDados(); setCarregandoProduto(false)
  }
  const produtosFiltrados = listaProdutos.filter(p => {
    const matchNome = filtroProdNome ? p.nome.toLowerCase().includes(filtroProdNome.toLowerCase()) : true
    const matchCat = filtroProdCat ? p.categoria === filtroProdCat : true
    return matchNome && matchCat
  })
  
  const exportarProdutosCSV = () => {
    const headers = ['ID', 'Nome', 'Categoria', 'Estoque', 'Preco']
    const rows = listaProdutos.map(p => [p.id, `"${p.nome}"`, `"${p.categoria || '-'}"`, p.estoque || 0, p.preco.toString().replace('.', ',')])
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n')
    const link = document.createElement('a'); link.setAttribute('href', encodeURI(csvContent)); link.setAttribute('download', 'relatorio_produtos.csv'); document.body.appendChild(link); link.click(); document.body.removeChild(link)
  }

  const gerarRelatorioProdutosPDF = async () => {
    setMensagem('Gerando PDF do catálogo/produtos...')
    try {
      // @ts-ignore
      const html2pdf = (await import('html2pdf.js')).default
      let linhasTabela = ''
      listaProdutos.forEach(p => {
        linhasTabela += `
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 10px; text-align: center;">
              ${p.imagem_url ? `<img src="${p.imagem_url}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;" />` : '<span>-</span>'}
            </td>
            <td style="padding: 10px; font-weight: bold; color: #1f2937;">${p.nome}</td>
            <td style="padding: 10px; color: #4b5563;">${p.categoria || '-'}</td>
            <td style="padding: 10px; text-align: center; color: #2563eb; font-weight: bold;">${p.estoque ?? 0} un.</td>
            <td style="padding: 10px; text-align: right; color: #166534; font-weight: bold;">R$ ${Number(p.preco).toFixed(2)}</td>
          </tr>
        `
      })
      const htmlPdf = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h1 style="color: #2563eb; text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">Relatório de Produtos e Estoque</h1>
          <p style="text-align: center; color: #666; font-size: 12px; margin-bottom: 20px;">Data de emissão: ${new Date().toLocaleDateString('pt-BR')}</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
              <tr style="background-color: #2563eb; color: white;">
                <th style="padding: 12px; text-align: center;">Foto</th>
                <th style="padding: 12px; text-align: left;">Nome do Produto</th>
                <th style="padding: 12px; text-align: left;">Categoria</th>
                <th style="padding: 12px; text-align: center;">Estoque</th>
                <th style="padding: 12px; text-align: right;">Preço</th>
              </tr>
            </thead>
            <tbody>
              ${linhasTabela}
            </tbody>
          </table>
        </div>
      `
      const opcoesPdf: any = { margin: 10, filename: `relatorio_produtos_estoque.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } }
      await html2pdf().set(opcoesPdf).from(htmlPdf).save()
      setMensagem('PDF de produtos gerado com sucesso!')
    } catch (error: any) { setMensagem(`Erro ao gerar PDF: ${error.message}`) }
  }

  const gerarDescricaoIA = async () => {
    if (!nome) return setMensagem('⚠️ Digite o nome do produto primeiro!')
    setGerandoIA(true); setMensagem('✨ IA escrevendo...')
    try {
      const resultado = await gerarDescricaoAcao(nome, categoria)
      setDescricao(resultado.descricao || '')
      setMensagem('✅ Descrição gerada!')
    } catch (error: any) { setMensagem(`❌ Erro na IA: ${error.message}`) }
    setGerandoIA(false)
  }

  // Banners & Categorias
  const handleSalvarBanner = async (e: React.FormEvent) => { e.preventDefault(); if (!imagemBanner) return; setCarregandoBanner(true); const ext = imagemBanner.name.split('.').pop(); const nomeArq = `banner_${Math.random()}.${ext}`; await supabase.storage.from('produtos-imagens').upload(nomeArq, imagemBanner); const { data } = supabase.storage.from('produtos-imagens').getPublicUrl(nomeArq); await supabase.from('banners').insert([{ titulo: tituloBanner, imagem_url: data.publicUrl }]); setMensagem('Banner salvo!'); setTituloBanner(''); setImagemBanner(null); carregarDados(); setCarregandoBanner(false) }
  const handleSalvarCategoria = async (e: React.FormEvent) => { e.preventDefault(); setCarregandoCategoria(true); await supabase.from('categorias').insert([{ nome: novaCategoria }]); setMensagem('Categoria criada!'); setNovaCategoria(''); carregarDados(); setCarregandoCategoria(false) }

  // Vendedores
  const iniciarEdicaoVendedor = (v: any) => { setIdVendedorEdicao(v.id); setNomeVendedor(v.nome); setTelefoneVendedor(v.telefone); setComissaoVendedor(v.comissao_percentual.toString()); setSenhaVendedor(v.senha || ''); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const cancelarEdicaoVendedor = () => { setIdVendedorEdicao(null); setNomeVendedor(''); setTelefoneVendedor(''); setComissaoVendedor(''); setSenhaVendedor('') }
  const handleSalvarVendedor = async (e: React.FormEvent) => { e.preventDefault(); setCarregandoVendedor(true); const com = parseFloat(comissaoVendedor.replace(',', '.')) || 0; if (idVendedorEdicao) { await supabase.from('pessoas').update({ nome: nomeVendedor, telefone: telefoneVendedor, comissao_percentual: com, senha: senhaVendedor }).eq('id', idVendedorEdicao); setMensagem('Vendedor atualizado!') } else { await supabase.from('pessoas').insert([{ nome: nomeVendedor, telefone: telefoneVendedor, tipo: 'vendedor', comissao_percentual: com, senha: senhaVendedor }]); setMensagem('Vendedor cadastrado!') } cancelarEdicaoVendedor(); carregarDados(); setCarregandoVendedor(false) }

  // Pagamentos
  const iniciarEdicaoPagamento = (pag: any) => { setIdPagamentoEdicao(pag.id); setPagTitulo(pag.titulo); setPagDescricao(pag.descricao || ''); setPagValorMinimo(pag.valor_minimo ? pag.valor_minimo.toString() : ''); setPagOrdem(pag.ordem.toString()); setPagStatusAtivo(pag.status_ativo); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const cancelarEdicaoPagamento = () => { setIdPagamentoEdicao(null); setPagTitulo(''); setPagDescricao(''); setPagValorMinimo(''); setPagOrdem('1'); setPagStatusAtivo(true) }
  const handleSalvarPagamento = async (e: React.FormEvent) => { 
    e.preventDefault(); setCarregandoPagamento(true)
    const vm = pagValorMinimo ? parseFloat(pagValorMinimo.replace(',', '.')) : 0
    const ord = parseInt(pagOrdem) || 1
    const payload = { titulo: pagTitulo, descricao: pagDescricao, valor_minimo: vm, ordem: ord, status_ativo: pagStatusAtivo }
    if (idPagamentoEdicao) { await supabase.from('formas_pagamento').update(payload).eq('id', idPagamentoEdicao); setMensagem('Forma de Pagamento atualizada!') } 
    else { await supabase.from('formas_pagamento').insert([payload]); setMensagem('Forma de Pagamento cadastrada!') } 
    cancelarEdicaoPagamento(); carregarDados(); setCarregandoPagamento(false) 
  }

  // Clientes CRM
  const limparFormCli = () => { setIdCliEdicao(null); setCliRazao(''); setCliFantasia(''); setCliCpfCnpj(''); setCliTelefone(''); setCliCidade(''); setCliEstado(''); setCliRepresentante(''); setCliStatusAtivo(true); setCliTipoPessoa('Jurídica'); setCliSenha('') }
  const iniciarEdicaoCliente = (c: any) => { setIdCliEdicao(c.id); setCliRazao(c.nome); setCliFantasia(c.nome_fantasia || ''); setCliCpfCnpj(c.cpf_cnpj || ''); setCliTelefone(c.telefone || ''); setCliCidade(c.cidade || ''); setCliEstado(c.estado || ''); setCliRepresentante(c.representante_id ? c.representante_id.toString() : ''); setCliStatusAtivo(c.status_ativo); setCliTipoPessoa(c.tipo_pessoa || 'Física'); setCliSenha(c.senha || ''); setMostrarFormCli(true); setMostrarFiltrosCli(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const handleSalvarCliente = async (e: React.FormEvent) => { 
    e.preventDefault()
    const payload = { nome: cliRazao, nome_fantasia: cliFantasia, cpf_cnpj: cliCpfCnpj, telefone: cliTelefone, cidade: cliCidade, estado: cliEstado, tipo_pessoa: cliTipoPessoa, status_ativo: cliStatusAtivo, representante_id: cliRepresentante ? parseInt(cliRepresentante) : null, tipo: 'cliente', senha: cliSenha }
    if (idCliEdicao) { await supabase.from('pessoas').update(payload).eq('id', idCliEdicao); setMensagem('Cliente atualizado!') } 
    else { await supabase.from('pessoas').insert([payload]); setMensagem('Cliente cadastrado!') } 
    limparFormCli(); setMostrarFormCli(false); carregarDados() 
  }
  const limparFiltrosCli = () => { setFiltroCliNome(''); setFiltroCliCpf(''); setFiltroCliRep(''); setFiltroCliCidade(''); setFiltroCliEstado(''); setFiltroCliStatus('') }
  const clientesFiltrados = listaClientes.filter(c => { 
    const matchNome = filtroCliNome ? (c.nome?.toLowerCase().includes(filtroCliNome.toLowerCase()) || c.nome_fantasia?.toLowerCase().includes(filtroCliNome.toLowerCase())) : true
    const matchCpf = filtroCliCpf ? c.cpf_cnpj?.includes(filtroCliCpf) : true
    const matchRep = filtroCliRep ? c.representante_id?.toString() === filtroCliRep : true
    const matchCid = filtroCliCidade ? c.cidade?.toLowerCase().includes(filtroCliCidade.toLowerCase()) : true
    const matchEst = filtroCliEstado ? c.estado === filtroCliEstado : true
    const matchStat = filtroCliStatus !== '' ? c.status_ativo?.toString() === filtroCliStatus : true
    return matchNome && matchCpf && matchRep && matchCid && matchEst && matchStat 
  })
  const exportarClientesCSV = () => {
    const headers = ['ID', 'Nome/Razao', 'CPF/CNPJ', 'Telefone', 'Cidade', 'Estado', 'Tipo']
    const rows = listaClientes.map(c => [c.id, `"${c.nome}"`, c.cpf_cnpj, c.telefone, c.cidade, c.estado, c.tipo_pessoa])
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n')
    const link = document.createElement('a'); link.setAttribute('href', encodeURI(csvContent)); link.setAttribute('download', 'relatorio_clientes.csv'); document.body.appendChild(link); link.click(); document.body.removeChild(link)
  }

  // Pedidos & Filtros & Exportação CSV
  const atualizarStatusPedido = async (id: number, novoStatus: string) => { await supabase.from('pedidos').update({ status: novoStatus }).eq('id', id); setMensagem(`Pedido #${id} atualizado`); carregarDados() }
  const pedidosFiltrados = listaPedidos.filter(p => {
    const matchId = filtroPedId ? p.id.toString().includes(filtroPedId) : true
    const matchStatus = filtroPedStatus ? p.status === filtroPedStatus : true
    return matchId && matchStatus
  })
  const exportarPedidosCSV = () => {
    const headers = ['ID', 'Data', 'Status', 'Pagamento', 'Valor Total']
    const rows = listaPedidos.map(p => [p.id, `"${new Date(p.data_pedido).toLocaleDateString('pt-BR')}"`, `"${p.status}"`, `"${p.forma_pagamento || '-'}"`, p.valor_total.toString().replace('.', ',')])
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n')
    const link = document.createElement('a'); link.setAttribute('href', encodeURI(csvContent)); link.setAttribute('download', 'relatorio_pedidos.csv'); document.body.appendChild(link); link.click(); document.body.removeChild(link)
  }

  const reimprimirPedido = async (pedido: any) => {
    setMensagem(`Buscando dados do Pedido #${pedido.id}...`)
    try {
      const { data: itens, error } = await supabase.from('itens_pedido').select('*').eq('pedido_id', pedido.id)
      if (error) throw error
      const cliente = listaClientes.find(c => c.id === pedido.cliente_id)
      const vendedor = listaVendedores.find(v => v.id === pedido.vendedor_id)
      // @ts-ignore
      const html2pdf = (await import('html2pdf.js')).default
      const htmlPdf = `<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;"><h1 style="color: #2563eb; text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">Pedido de Venda #${pedido.id} (2ª Via)</h1><div style="display: flex; justify-content: space-between; margin-bottom: 20px; margin-top: 20px;"><div style="width: 48%; padding: 15px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px;"><h3 style="margin-top: 0; color: #1f2937; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Dados do Cliente</h3><p style="margin: 5px 0;"><strong>Nome:</strong> ${cliente?.nome || 'Desconhecido'}</p><p style="margin: 5px 0;"><strong>Telefone:</strong> ${cliente?.telefone || '-'}</p></div><div style="width: 48%; padding: 15px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px;"><h3 style="margin-top: 0; color: #1f2937; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Dados Comerciais</h3><p style="margin: 5px 0;"><strong>Responsável:</strong> ${vendedor?.nome || 'Não informado'}</p><p style="margin: 5px 0;"><strong>Pagamento:</strong> ${pedido.forma_pagamento || '-'}</p><p style="margin: 5px 0;"><strong>Status:</strong> ${pedido.status}</p></div></div><table style="width: 100%; border-collapse: collapse; margin-top: 20px;"><thead><tr style="background-color: #2563eb; color: white;"><th style="padding: 12px; text-align: left;">Produto</th><th style="padding: 12px; text-align: center;">Qtd</th><th style="padding: 12px; text-align: right;">V. Unitário</th><th style="padding: 12px; text-align: right;">Subtotal</th></tr></thead><tbody>${itens?.map((item: any) => `<tr style="border-bottom: 1px solid #e5e7eb;"><td style="padding: 12px;">${item.produto_nome}</td><td style="padding: 12px; text-align: center;">${item.quantidade}</td><td style="padding: 12px; text-align: right;">R$ ${Number(item.preco_unitario).toFixed(2)}</td><td style="padding: 12px; text-align: right;">R$ ${(Number(item.preco_unitario) * Number(item.quantidade)).toFixed(2)}</td></tr>`).join('')}</tbody></table><div style="margin-top: 20px; text-align: right; font-size: 18px;"><strong>Total do Pedido: <span style="color: #166534;">R$ ${Number(pedido.valor_total).toFixed(2)}</span></strong></div></div>`
      const opcoesPdf: any = { margin: 10, filename: `reimpressao_pedido_${pedido.id}.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } }
      await html2pdf().set(opcoesPdf).from(htmlPdf).save()
      setMensagem('Reimpressão gerada com sucesso!')
    } catch (error: any) { setMensagem(`Erro na reimpressão: ${error.message}`) }
  }

  const gerarRelatorioPDF = async () => {
    setMensagem('Gerando PDF do relatório...')
    try {
      // @ts-ignore
      const html2pdf = (await import('html2pdf.js')).default
      let linhasTabela = ''; let totalGeralVendido = 0; let totalGeralComissao = 0
      listaVendedores.forEach(vend => {
        const pedidosDesteVendedor = listaPedidos.filter(p => p.vendedor_id === vend.id)
        const totalVendido = pedidosDesteVendedor.reduce((acc, pedido) => acc + Number(pedido.valor_total), 0)
        const valorComissao = totalVendido * (vend.comissao_percentual / 100)
        totalGeralVendido += totalVendido; totalGeralComissao += valorComissao
        linhasTabela += `<tr style="border-bottom: 1px solid #e5e7eb;"><td style="padding: 12px;">${vend.nome}</td><td style="padding: 12px; text-align: center;">${vend.comissao_percentual}%</td><td style="padding: 12px; text-align: right;">R$ ${totalVendido.toFixed(2)}</td><td style="padding: 12px; text-align: right; color: #166534; font-weight: bold;">R$ ${valorComissao.toFixed(2)}</td></tr>`
      })
      const htmlPdf = `<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;"><h1 style="color: #9333ea; text-align: center; border-bottom: 2px solid #9333ea; padding-bottom: 10px;">Fechamento de Comissões</h1><table style="width: 100%; border-collapse: collapse; margin-top: 30px;"><thead style="background-color: #f3f4f6;"><tr><th style="padding: 12px; text-align: left;">Vendedor</th><th style="padding: 12px;">Taxa (%)</th><th style="padding: 12px; text-align: right;">Total Vendido</th><th style="padding: 12px; text-align: right;">Comissão a Pagar</th></tr></thead><tbody>${linhasTabela}</tbody></table><div style="margin-top: 40px; padding: 20px; background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;"><div style="display: flex; justify-content: space-between; font-size: 16px;"><span>Total Vendido Bruto:</span><strong>R$ ${totalGeralVendido.toFixed(2)}</strong></div><div style="display: flex; justify-content: space-between; font-size: 20px; margin-top: 15px; color: #9333ea;"><span>Total de Comissões a Pagar:</span><strong>R$ ${totalGeralComissao.toFixed(2)}</strong></div></div></div>`
      const opcoesPdf: any = { margin: 10, filename: `relatorio_comissoes.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } }
      await html2pdf().set(opcoesPdf).from(htmlPdf).save()
      setMensagem('PDF do relatório gerado com sucesso!')
    } catch (error: any) { setMensagem(`Erro ao gerar PDF: ${error.message}`) }
  }

  if (!usuarioLogado) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm border border-gray-200">
          <div className="text-center mb-8"><h2 className="text-3xl font-black text-gray-900">ERP Login</h2></div>
          {erroLogin && <p className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6 text-center font-medium">{erroLogin}</p>}
          <div className="space-y-4">
            <input type="text" required value={loginUser} onChange={e => setLoginUser(e.target.value)} className="w-full p-3 border rounded-lg" placeholder="Usuário / Telefone" />
            <input type="password" required value={loginSenha} onChange={e => setLoginSenha(e.target.value)} className="w-full p-3 border rounded-lg" placeholder="Senha" />
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg">Entrar no Sistema</button>
          </div>
        </form>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-50 text-gray-900">
      <div className="max-w-[1400px] mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold uppercase text-gray-700">{abaAtiva === 'minhaLoja' ? 'Minha Loja' : abaAtiva}</h1>
            <p className="text-sm text-gray-500">Logado como: <strong className="text-blue-600">{usuarioLogado.nome}</strong></p>
          </div>
          <button onClick={() => setUsuarioLogado(null)} className="text-sm bg-gray-100 hover:bg-red-100 text-gray-700 font-bold py-2 px-4 rounded-lg">Sair</button>
        </div>

        <div className="flex flex-wrap border-b border-gray-200 mb-6 text-sm">
          {usuarioLogado.tipo === 'admin' && (
            <>
              <button onClick={() => setAbaAtiva('produto')} className={`flex-1 py-3 font-semibold ${abaAtiva === 'produto' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Produtos</button>
              <button onClick={() => setAbaAtiva('banner')} className={`flex-1 py-3 font-semibold ${abaAtiva === 'banner' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Banners</button>
              <button onClick={() => setAbaAtiva('categoria')} className={`flex-1 py-3 font-semibold ${abaAtiva === 'categoria' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Categorias</button>
              <button onClick={() => setAbaAtiva('vendedor')} className={`flex-1 py-3 font-semibold ${abaAtiva === 'vendedor' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500'}`}>Vendedores</button>
              <button onClick={() => setAbaAtiva('pagamentos')} className={`flex-1 py-3 font-semibold ${abaAtiva === 'pagamentos' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}>Pagamentos</button>
              <button onClick={() => setAbaAtiva('minhaLoja')} className={`flex-1 py-3 font-semibold ${abaAtiva === 'minhaLoja' ? 'border-b-2 border-amber-600 text-amber-600' : 'text-gray-500'}`}>🏢 Minha Loja</button>
            </>
          )}
          <button onClick={() => setAbaAtiva('clientes')} className={`flex-1 py-3 font-semibold ${abaAtiva === 'clientes' ? 'border-b-2 border-teal-500 text-teal-600' : 'text-gray-500'}`}>Clientes</button>
          <button onClick={() => setAbaAtiva('pedidos')} className={`flex-1 py-3 font-semibold ${abaAtiva === 'pedidos' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500'}`}>Gestão de Pedidos</button>
          <button onClick={() => setAbaAtiva('relatorio')} className={`flex-1 py-3 font-semibold ${abaAtiva === 'relatorio' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-500'}`}>Relatórios</button>
        </div>

        {/* ABA MINHA LOJA */}
        {abaAtiva === 'minhaLoja' && usuarioLogado.tipo === 'admin' && (
          <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-xl mb-2 text-gray-800">🏢 Configurações da Empresa (Nuvem)</h3>
            <p className="text-sm text-gray-500 mb-6">Salvo diretamente no Supabase para sincronizar com o catálogo.</p>
            <form onSubmit={salvarConfigLoja} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Nome da Empresa</label><input type="text" value={dadosLoja.nome} onChange={e => setDadosLoja({...dadosLoja, nome: e.target.value})} className="w-full p-2 border rounded-md" required /></div>
                <div><label className="block text-sm font-medium mb-1">WhatsApp de Vendas</label><input type="text" value={dadosLoja.whatsapp} onChange={e => setDadosLoja({...dadosLoja, whatsapp: e.target.value})} placeholder="5544999999999" className="w-full p-2 border rounded-md" /></div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Logo da Empresa</label>
                <input type="file" accept="image/*" onChange={e => setLogoArquivo(e.target.files?.[0] || null)} className="w-full p-2 border rounded-md bg-white text-sm" />
                {dadosLoja.logo && <div className="mt-2 flex items-center gap-2"><span className="text-xs text-gray-500">Logo atual:</span><img src={dadosLoja.logo} alt="Logo" className="h-10 object-contain border rounded p-1" /></div>}
              </div>
              <hr className="my-4" /><h4 className="font-semibold text-gray-700">📍 Endereço</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Rua e Número</label><input type="text" value={dadosLoja.endereco} onChange={e => setDadosLoja({...dadosLoja, endereco: e.target.value})} className="w-full p-2 border rounded-md" /></div>
                <div><label className="block text-sm font-medium mb-1">Cidade / Estado</label><input type="text" value={dadosLoja.cidadeEstado} onChange={e => setDadosLoja({...dadosLoja, cidadeEstado: e.target.value})} className="w-full p-2 border rounded-md" /></div>
              </div>
              <div><label className="block text-sm font-medium mb-1">CEP</label><input type="text" value={dadosLoja.cep} onChange={e => setDadosLoja({...dadosLoja, cep: e.target.value})} className="w-full p-2 border rounded-md" /></div>
              <hr className="my-4" /><h4 className="font-semibold text-gray-700">🌐 Redes Sociais</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Instagram</label><input type="text" value={dadosLoja.instagram} onChange={e => setDadosLoja({...dadosLoja, instagram: e.target.value})} className="w-full p-2 border rounded-md" /></div>
                <div><label className="block text-sm font-medium mb-1">Facebook</label><input type="text" value={dadosLoja.facebook} onChange={e => setDadosLoja({...dadosLoja, facebook: e.target.value})} className="w-full p-2 border rounded-md" /></div>
              </div>
              <hr className="my-4" /><h4 className="font-semibold text-gray-700">📄 Páginas Institucionais</h4>
              <div><label className="block text-sm font-medium mb-1">Quem Somos</label><textarea rows={3} value={dadosLoja.quemSomos} onChange={e => setDadosLoja({...dadosLoja, quemSomos: e.target.value})} className="w-full p-2 border rounded-md text-sm" /></div>
              <div><label className="block text-sm font-medium mb-1">Dúvidas Frequentes</label><textarea rows={3} value={dadosLoja.duvidasFrequentes} onChange={e => setDadosLoja({...dadosLoja, duvidasFrequentes: e.target.value})} className="w-full p-2 border rounded-md text-sm" /></div>
              <div><label className="block text-sm font-medium mb-1">Termos e Políticas</label><textarea rows={3} value={dadosLoja.termosPoliticas} onChange={e => setDadosLoja({...dadosLoja, termosPoliticas: e.target.value})} className="w-full p-2 border rounded-md text-sm" /></div>
              <button type="submit" disabled={carregandoLogo} className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-md transition-colors mt-6">
                {carregandoLogo ? 'Salvando...' : 'Salvar Configurações da Loja'}
              </button>
            </form>
          </div>
        )}

        {/* ABA PRODUTOS (Com botões Adicionar, Filtrar, PDF e Exportar CSV) */}
        {abaAtiva === 'produto' && usuarioLogado.tipo === 'admin' && (
          <div>
            <div className="flex gap-2 mb-6 flex-wrap">
              <button onClick={() => { limparFormProd(); setMostrarFormProd(!mostrarFormProd); setMostrarFiltrosProd(false) }} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow-sm text-sm">+ Adicionar</button>
              <button onClick={() => { setMostrarFiltrosProd(!mostrarFiltrosProd); setMostrarFormProd(false) }} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-sm text-sm">🔍 Filtrar</button>
              <button onClick={gerarRelatorioProdutosPDF} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded shadow-sm text-sm">📄 Baixar PDF / Imprimir</button>
              <button onClick={exportarProdutosCSV} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded shadow-sm text-sm">📥 Exportar CSV</button>
            </div>

            {mostrarFiltrosProd && (
              <div className="bg-gray-50 p-4 border rounded-md mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><label className="block text-gray-600 mb-1">Nome do Produto</label><input type="text" value={filtroProdNome} onChange={e=>setFiltroProdNome(e.target.value)} className="w-full p-2 border rounded bg-white" placeholder="Pesquisar por nome..." /></div>
                <div>
                  <label className="block text-gray-600 mb-1">Categoria</label>
                  <select value={filtroProdCat} onChange={e=>setFiltroProdCat(e.target.value)} className="w-full p-2 border rounded bg-white">
                    <option value="">Todas as Categorias</option>
                    {categoriasCadastradas.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2 flex justify-end"><button onClick={() => { setFiltroProdNome(''); setFiltroProdCat('') }} className="bg-red-500 text-white px-4 py-1.5 rounded font-bold text-xs">Limpar Filtros</button></div>
              </div>
            )}

            {mostrarFormProd && (
              <form onSubmit={handleSalvarProduto} className="bg-white p-6 border border-green-200 rounded mb-6 shadow-sm text-sm space-y-4">
                <h3 className="font-bold text-green-700 text-lg border-b pb-2">{idProdutoEdicao ? 'Editar Produto' : 'Novo Produto'}</h3>
                <div><label className="block text-sm font-medium mb-1">Nome</label><input type="text" required value={nome} onChange={(e) => setNome(e.target.value)} className="w-full p-2 border rounded-md bg-white" /></div>
                <div className="grid grid-cols-3 gap-4">
                  <div><label className="block text-sm font-medium mb-1">Preço (R$)</label><input type="text" required value={preco} onChange={(e) => setPreco(e.target.value)} className="w-full p-2 border rounded-md bg-white" /></div>
                  <div><label className="block text-sm font-medium mb-1">Estoque (Qtd)</label><input type="number" required value={estoque} onChange={(e) => setEstoque(e.target.value)} className="w-full p-2 border rounded-md bg-white" /></div>
                  <div><label className="block text-sm font-medium mb-1">Categoria</label><select required value={categoria} onChange={(e) => setCategoria(e.target.value)} className="w-full p-2 border rounded-md bg-white">{categoriasCadastradas.map(cat => <option key={cat.id} value={cat.nome}>{cat.nome}</option>)}</select></div>
                </div>
                <div className="flex justify-between items-center"><label className="block text-sm font-medium">Descrição</label><button type="button" onClick={gerarDescricaoIA} disabled={gerandoIA || !nome} className="text-xs bg-purple-100 text-purple-700 px-3 py-1 font-bold rounded">✨ Gerar IA</button></div>
                <textarea rows={3} value={descricao} onChange={(e) => setDescricao(e.target.value)} className="w-full p-2 border rounded-md text-sm bg-white" />
                <div><label className="block text-sm font-medium mb-1">Foto</label><input type="file" accept="image/*" onChange={(e) => setImagemProduto(e.target.files?.[0] || null)} className="w-full p-2 border rounded-md bg-white" /></div>
                
                <div className="flex flex-wrap gap-6 p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-sm"><input type="checkbox" checked={isDestaque} onChange={e=>setIsDestaque(e.target.checked)} className="w-5 h-5 accent-blue-600" /> ⭐ Destaque</label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-sm"><input type="checkbox" checked={isNovo} onChange={e=>setIsNovo(e.target.checked)} className="w-5 h-5 accent-green-600" /> ✨ Novidade</label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-sm"><input type="checkbox" checked={isPromocao} onChange={e=>setIsPromocao(e.target.checked)} className="w-5 h-5 accent-red-600" /> 🔥 Promoção</label>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button type="button" onClick={() => { setMostrarFormProd(false); limparFormProd() }} className="bg-gray-300 px-4 py-2 rounded font-bold">Cancelar</button>
                  <button type="submit" disabled={carregandoProduto} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-bold">{idProdutoEdicao ? 'Salvar Alterações' : 'Salvar Produto'}</button>
                </div>
              </form>
            )}
            
            <h3 className="font-bold border-b pb-2 mb-4">Painel de Produtos Cadastrados</h3>
            <div className="overflow-x-auto border border-gray-200 shadow-sm rounded-lg">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-gray-100 text-gray-700">
                  <tr><th className="p-3 border-r">Foto</th><th className="p-3 border-r">Nome</th><th className="p-3 border-r">Categoria</th><th className="p-3 border-r">Estoque</th><th className="p-3 border-r">Preço</th><th className="p-3 text-center">Ações</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {produtosFiltrados.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="p-3 border-r w-16">{p.imagem_url ? <img src={p.imagem_url} className="w-10 h-10 object-cover rounded" /> : <div className="w-10 h-10 bg-gray-200 rounded"></div>}</td>
                      <td className="p-3 border-r font-medium text-gray-900">{p.nome}</td>
                      <td className="p-3 border-r text-gray-600">{p.categoria || '-'}</td>
                      <td className="p-3 border-r font-bold text-blue-600">{p.estoque ?? 0} un.</td>
                      <td className="p-3 border-r font-bold text-green-700">R$ {p.preco.toFixed(2)}</td>
                      <td className="p-3 text-center flex justify-center gap-2">
                        <button onClick={() => iniciarEdicaoProduto(p)} className="bg-blue-500 text-white px-3 py-1 rounded text-xs font-bold">Editar</button>
                        <button onClick={() => excluirItem('produtos', p.id)} className="bg-red-500 text-white px-3 py-1 rounded text-xs font-bold">Excluir</button>
                      </td>
                    </tr>
                  ))}
                  {produtosFiltrados.length === 0 && (<tr><td colSpan={6} className="p-6 text-center text-gray-500">Nenhum produto encontrado.</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* OUTRAS ABAS */}
        {abaAtiva === 'banner' && usuarioLogado.tipo === 'admin' && (
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSalvarBanner} className="space-y-4 mb-8">
              <div><label className="block text-sm mb-1">Título</label><input type="text" required value={tituloBanner} onChange={e => setTituloBanner(e.target.value)} className="w-full p-2 border rounded-md" /></div>
              <div><label className="block text-sm mb-1">Imagem</label><input type="file" required accept="image/*" onChange={e => setImagemBanner(e.target.files?.[0] || null)} className="w-full p-2 border rounded-md" /></div>
              <button type="submit" disabled={carregandoBanner} className="w-full bg-blue-600 text-white font-bold py-2 rounded-md">Publicar Banner</button>
            </form>
            <h3 className="font-bold border-b pb-2 mb-4">Banners</h3>
            <ul className="space-y-2">{listaBanners.map(b => (<li key={b.id} className="flex justify-between text-sm bg-gray-50 p-2 rounded"><span>{b.titulo}</span><button onClick={() => excluirItem('banners', b.id)} className="text-red-500 font-bold">Excluir</button></li>))}</ul>
          </div>
        )}

        {abaAtiva === 'categoria' && usuarioLogado.tipo === 'admin' && (
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSalvarCategoria} className="space-y-4 mb-8">
              <div><label className="block text-sm font-medium mb-1">Nova Categoria</label><input type="text" required value={novaCategoria} onChange={e => setNovaCategoria(e.target.value)} className="w-full p-2 border rounded-md" /></div>
              <button type="submit" disabled={carregandoCategoria} className="w-full bg-blue-600 text-white font-bold py-2 rounded-md">Salvar</button>
            </form>
            <h3 className="font-bold border-b pb-2 mb-4">Categorias</h3>
            <ul className="space-y-2 text-sm">{categoriasCadastradas.map(c => (<li key={c.id} className="flex justify-between bg-gray-50 p-2 rounded"><span>{c.nome}</span><button onClick={() => excluirItem('categorias', c.id)} className="text-red-500 font-bold">Excluir</button></li>))}</ul>
          </div>
        )}

        {abaAtiva === 'vendedor' && usuarioLogado.tipo === 'admin' && (
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSalvarVendedor} className={`space-y-4 mb-8 p-4 rounded-xl border ${idVendedorEdicao ? 'bg-blue-50/30 border-blue-200' : 'bg-green-50/30 border-green-100'}`}>
              {idVendedorEdicao && <div className="text-blue-600 font-bold text-sm mb-2">Editando Vendedor</div>}
              <div><label className="block text-sm font-medium mb-1">Nome</label><input type="text" required value={nomeVendedor} onChange={e => setNomeVendedor(e.target.value)} className="w-full p-2 border rounded-md" /></div>
              <div className="flex gap-4">
                <div className="w-1/3"><label className="block text-sm font-medium mb-1">Telefone</label><input type="text" required value={telefoneVendedor} onChange={e => setTelefoneVendedor(e.target.value)} className="w-full p-2 border rounded-md" /></div>
                <div className="w-1/3"><label className="block text-sm font-medium mb-1">Senha</label><input type="text" required value={senhaVendedor} onChange={e => setSenhaVendedor(e.target.value)} className="w-full p-2 border rounded-md" /></div>
                <div className="w-1/3"><label className="block text-sm font-medium mb-1">Comissão %</label><input type="number" step="0.1" required value={comissaoVendedor} onChange={e => setComissaoVendedor(e.target.value)} className="w-full p-2 border rounded-md" /></div>
              </div>
              <div className="flex gap-2">
                <button type="submit" className={`flex-1 text-white font-bold py-2 rounded-md ${idVendedorEdicao ? 'bg-blue-600' : 'bg-green-600'}`}>{idVendedorEdicao ? 'Salvar Alterações' : 'Cadastrar Vendedor'}</button>
                {idVendedorEdicao && <button type="button" onClick={cancelarEdicaoVendedor} className="px-4 py-2 bg-gray-300 font-bold rounded-md">Cancelar</button>}
              </div>
            </form>
            <h3 className="font-bold border-b pb-2 mb-4">Vendedores</h3>
            <ul className="space-y-2 text-sm">{listaVendedores.map(v => (<li key={v.id} className="flex justify-between items-center bg-gray-50 p-3 rounded"><span>{v.nome} ({v.telefone}) - Senha: {v.senha} - Com. {v.comissao_percentual}%</span><div className="flex gap-2"><button onClick={() => iniciarEdicaoVendedor(v)} className="text-blue-600 font-bold">Editar</button><button onClick={() => excluirItem('pessoas', v.id)} className="text-red-500 font-bold">Excluir</button></div></li>))}</ul>
          </div>
        )}

        {abaAtiva === 'pagamentos' && usuarioLogado.tipo === 'admin' && (
          <div>
            <form onSubmit={handleSalvarPagamento} className={`space-y-4 mb-8 p-4 rounded-xl border ${idPagamentoEdicao ? 'bg-indigo-50/50 border-indigo-200' : 'bg-gray-50 border-gray-200'}`}>
              {idPagamentoEdicao && <div className="text-indigo-600 font-bold text-sm mb-2">Editando Forma de Pagamento</div>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Título</label><input type="text" required value={pagTitulo} onChange={(e) => setPagTitulo(e.target.value)} className="w-full p-2 border rounded-md bg-white" placeholder="Ex: Cartão de Crédito" /></div>
                <div><label className="block text-sm font-medium mb-1">Descrição</label><input type="text" value={pagDescricao} onChange={(e) => setPagDescricao(e.target.value)} className="w-full p-2 border rounded-md bg-white" placeholder="Ex: Até 10x sem juros" /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div><label className="block text-sm font-medium mb-1">Val. Mínimo (R$)</label><input type="text" value={pagValorMinimo} onChange={(e) => setPagValorMinimo(e.target.value)} className="w-full p-2 border rounded-md bg-white" placeholder="0,00" /></div>
                <div><label className="block text-sm font-medium mb-1">Ordem</label><input type="number" required value={pagOrdem} onChange={(e) => setPagOrdem(e.target.value)} className="w-full p-2 border rounded-md bg-white" /></div>
                <div className="flex items-center h-10"><label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700"><input type="checkbox" checked={pagStatusAtivo} onChange={(e) => setPagStatusAtivo(e.target.checked)} className="w-5 h-5 accent-indigo-600" /> Status Ativo</label></div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={carregandoPagamento} className={`flex-1 text-white font-bold py-2.5 rounded-md ${idPagamentoEdicao ? 'bg-indigo-600' : 'bg-green-600'}`}>{idPagamentoEdicao ? 'Salvar Alterações' : 'Cadastrar Pagamento'}</button>
                {idPagamentoEdicao && <button type="button" onClick={cancelarEdicaoPagamento} className="px-4 py-2 bg-gray-300 font-bold rounded-md">Cancelar</button>}
              </div>
            </form>
            <h3 className="font-bold border-b pb-2 mb-4">Formas de Pagamento</h3>
            <div className="overflow-x-auto border shadow-sm rounded-lg">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b"><tr><th className="p-3">Título</th><th className="p-3">Descrição</th><th className="p-3">Mínimo</th><th className="p-3 text-center">Ordem</th><th className="p-3 text-center">Status</th><th className="p-3 text-center">Ações</th></tr></thead>
                <tbody className="divide-y">
                  {listaPagamentos.map(pag => (
                    <tr key={pag.id} className="hover:bg-gray-50">
                      <td className="p-3 font-medium">{pag.titulo}</td>
                      <td className="p-3 text-gray-600">{pag.descricao || '-'}</td>
                      <td className="p-3">{pag.valor_minimo > 0 ? `R$ ${Number(pag.valor_minimo).toFixed(2)}` : '-'}</td>
                      <td className="p-3 text-center">{pag.ordem}</td>
                      <td className="p-3 text-center">{pag.status_ativo ? <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">✔</span> : <span className="bg-gray-300 text-gray-600 px-2 py-1 rounded text-xs font-bold">✖</span>}</td>
                      <td className="p-3 text-center flex justify-center gap-2"><button onClick={() => iniciarEdicaoPagamento(pag)} className="bg-blue-500 text-white px-3 py-1 rounded text-xs font-bold">Editar</button><button onClick={() => excluirItem('formas_pagamento', pag.id)} className="bg-red-500 text-white px-3 py-1 rounded text-xs font-bold">Excluir</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA CLIENTES */}
        {abaAtiva === 'clientes' && (
          <div>
            <div className="flex gap-2 mb-6">
              <button onClick={() => { limparFormCli(); setMostrarFormCli(!mostrarFormCli); setMostrarFiltrosCli(false) }} className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded shadow-sm text-sm">+ Adicionar</button>
              <button onClick={() => { setMostrarFiltrosCli(!mostrarFiltrosCli); setMostrarFormCli(false) }} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded shadow-sm text-sm">🔍 Filtrar</button>
              <button onClick={exportarClientesCSV} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded shadow-sm text-sm">📥 Exportar CSV</button>
            </div>

            {mostrarFiltrosCli && (
              <div className="bg-gray-50 p-4 border rounded-md mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><label className="block text-gray-600 mb-1">Nome / Razão</label><input type="text" value={filtroCliNome} onChange={e=>setFiltroCliNome(e.target.value)} className="w-full p-2 border rounded bg-white" /></div>
                <div><label className="block text-gray-600 mb-1">CPF / CNPJ</label><input type="text" value={filtroCliCpf} onChange={e=>setFiltroCliCpf(e.target.value)} className="w-full p-2 border rounded bg-white" /></div>
                <div><label className="block text-gray-600 mb-1">Cidade</label><input type="text" value={filtroCliCidade} onChange={e=>setFiltroCliCidade(e.target.value)} className="w-full p-2 border rounded bg-white" /></div>
                <div className="flex items-end"><button onClick={limparFiltrosCli} className="bg-red-500 text-white px-4 py-2 rounded font-bold text-xs">Limpar Filtros</button></div>
              </div>
            )}

            {mostrarFormCli && (
              <form onSubmit={handleSalvarCliente} className="bg-white p-6 border border-teal-200 rounded mb-6 shadow-sm text-sm">
                <h3 className="font-bold text-teal-700 mb-4 text-lg border-b pb-2">{idCliEdicao ? 'Editar Cliente' : 'Novo Cliente'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div><label className="block text-gray-600 mb-1">Tipo</label><select value={cliTipoPessoa} onChange={e=>setCliTipoPessoa(e.target.value)} className="w-full p-2 border rounded bg-white"><option>Física</option><option>Jurídica</option></select></div>
                  <div className="md:col-span-2"><label className="block text-gray-600 mb-1">Nome / Razão Social</label><input type="text" required value={cliRazao} onChange={e=>setCliRazao(e.target.value)} className="w-full p-2 border rounded" /></div>
                  <div><label className="block text-gray-600 mb-1">CPF / CNPJ</label><input type="text" value={cliCpfCnpj} onChange={e=>setCliCpfCnpj(e.target.value)} className="w-full p-2 border rounded" /></div>
                  <div><label className="block text-gray-600 mb-1">Telefone</label><input type="text" value={cliTelefone} onChange={e=>setCliTelefone(e.target.value)} className="w-full p-2 border rounded" /></div>
                  <div><label className="block text-gray-600 mb-1">Senha de Acesso</label><input type="text" required value={cliSenha} onChange={e=>setCliSenha(e.target.value)} className="w-full p-2 border rounded" /></div>
                  <div><label className="block text-gray-600 mb-1">Cidade</label><input type="text" value={cliCidade} onChange={e=>setCliCidade(e.target.value)} className="w-full p-2 border rounded" /></div>
                  <div><label className="block text-gray-600 mb-1">Estado</label><select value={cliEstado} onChange={e=>setCliEstado(e.target.value)} className="w-full p-2 border rounded bg-white"><option value="">UF</option><option value="PR">PR</option><option value="SP">SP</option><option value="SC">SC</option><option value="RS">RS</option><option value="MT">MT</option></select></div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={() => { setMostrarFormCli(false); limparFormCli() }} className="bg-gray-300 px-4 py-2 rounded font-bold">Cancelar</button>
                  <button type="submit" className="bg-teal-500 text-white px-6 py-2 rounded font-bold">{idCliEdicao ? 'Salvar Alterações' : 'Salvar Cliente'}</button>
                </div>
              </form>
            )}

            <div className="overflow-x-auto border shadow-sm rounded-lg">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 border-b"><tr><th className="p-3">Nome</th><th className="p-3">CPF/CNPJ</th><th className="p-3">Telefone</th><th className="p-3">Senha</th><th className="p-3">Cidade/UF</th><th className="p-3 text-center">Ações</th></tr></thead>
                <tbody className="divide-y">
                  {clientesFiltrados.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="p-3 font-medium text-gray-900">{c.nome}</td>
                      <td className="p-3 text-gray-600">{c.cpf_cnpj || '-'}</td>
                      <td className="p-3 text-gray-600">{c.telefone || '-'}</td>
                      <td className="p-3 font-mono text-blue-600 font-bold">{c.senha || '-'}</td>
                      <td className="p-3 text-gray-600">{c.cidade ? `${c.cidade}/${c.estado}` : '-'}</td>
                      <td className="p-3 text-center flex justify-center gap-2">
                        <button onClick={() => iniciarEdicaoCliente(c)} className="bg-blue-500 text-white px-2.5 py-1 rounded text-[11px] font-bold">Editar</button>
                        <button onClick={() => excluirItem('pessoas', c.id)} className="bg-red-500 text-white px-2.5 py-1 rounded text-[11px] font-bold">Excluir</button>
                      </td>
                    </tr>
                  ))}
                  {clientesFiltrados.length === 0 && (<tr><td colSpan={6} className="p-6 text-center text-gray-500">Nenhum cliente encontrado.</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA GESTÃO DE PEDIDOS */}
        {abaAtiva === 'pedidos' && (
          <div>
            <div className="flex gap-2 mb-6">
              <button onClick={() => setMostrarFiltrosPed(!mostrarFiltrosPed)} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded shadow-sm text-sm">🔍 Filtrar</button>
              <button onClick={exportarPedidosCSV} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded shadow-sm text-sm">📥 Exportar CSV</button>
            </div>

            {mostrarFiltrosPed && (
              <div className="bg-gray-50 p-4 border rounded-md mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><label className="block text-gray-600 mb-1">ID do Pedido</label><input type="text" value={filtroPedId} onChange={e=>setFiltroPedId(e.target.value)} className="w-full p-2 border rounded bg-white" placeholder="Ex: 12" /></div>
                <div>
                  <label className="block text-gray-600 mb-1">Status</label>
                  <select value={filtroPedStatus} onChange={e=>setFiltroPedStatus(e.target.value)} className="w-full p-2 border rounded bg-white">
                    <option value="">Todos os Status</option>
                    <option value="Pendente">Pendente</option>
                    <option value="Em Produção">Em Produção</option>
                    <option value="Despachado">Despachado</option>
                    <option value="Concluído">Concluído</option>
                  </select>
                </div>
                <div className="md:col-span-2 flex justify-end"><button onClick={() => { setFiltroPedId(''); setFiltroPedStatus('') }} className="bg-red-500 text-white px-4 py-1.5 rounded font-bold text-xs">Limpar Filtros</button></div>
              </div>
            )}

            <h3 className="font-bold text-xl mb-1">Controle de Pedidos</h3>
            <p className="text-sm text-gray-500 border-b pb-4 mb-6">Acompanhe todos os pedidos, altere status e reimprima em PDF.</p>
            <div className="overflow-x-auto border rounded-xl shadow-sm">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100"><tr><th className="p-3">ID</th><th className="p-3">Data</th><th className="p-3">Pagamento</th><th className="p-3 text-right">Total</th><th className="p-3 text-center">Status</th><th className="p-3 text-center">Ações</th></tr></thead>
                <tbody className="divide-y">
                  {pedidosFiltrados.map(pedido => (
                    <tr key={pedido.id} className="hover:bg-gray-50">
                      <td className="p-3 font-bold">#{pedido.id}</td>
                      <td className="p-3 text-gray-600">{new Date(pedido.data_pedido).toLocaleDateString('pt-BR')}</td>
                      <td className="p-3 text-blue-600 font-medium">{pedido.forma_pagamento || '-'}</td>
                      <td className="p-3 text-right font-bold text-green-700">R$ {Number(pedido.valor_total).toFixed(2)}</td>
                      <td className="p-3 text-center">
                        <select value={pedido.status} onChange={e => atualizarStatusPedido(pedido.id, e.target.value)} className="text-xs font-bold p-1 border rounded bg-white">
                          <option value="Pendente">Pendente</option><option value="Em Produção">Em Produção</option><option value="Despachado">Despachado</option><option value="Concluído">Concluído</option>
                        </select>
                      </td>
                      <td className="p-3 text-center flex justify-center gap-2">
                        <button onClick={() => reimprimirPedido(pedido)} className="bg-blue-500 text-white px-3 py-1 rounded text-xs font-bold">📄 PDF</button>
                        <button onClick={() => excluirItem('pedidos', pedido.id)} className="bg-red-500 text-white px-3 py-1 rounded text-xs font-bold">Excluir</button>
                      </td>
                    </tr>
                  ))}
                  {pedidosFiltrados.length === 0 && (<tr><td colSpan={6} className="p-8 text-center text-gray-500">Nenhum pedido encontrado.</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA RELATÓRIOS */}
        {abaAtiva === 'relatorio' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-xl">Fechamento de Comissões</h3>
              <button onClick={gerarRelatorioPDF} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded text-sm">📄 Baixar PDF Relatório</button>
            </div>
            <div className="overflow-hidden border rounded-xl shadow-sm">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100"><tr><th className="p-4">Vendedor</th><th className="p-4 text-center">Taxa (%)</th><th className="p-4 text-right">Total Vendido</th><th className="p-4 text-right text-purple-700">Comissão a Pagar</th></tr></thead>
                <tbody className="divide-y">
                  {listaVendedores.map(vend => {
                    const pedidosVend = listaPedidos.filter(p => p.vendedor_id === vend.id)
                    const totalVendido = pedidosVend.reduce((acc, p) => acc + Number(p.valor_total), 0)
                    const comissao = totalVendido * (vend.comissao_percentual / 100)
                    return (
                      <tr key={vend.id} className="hover:bg-gray-50">
                        <td className="p-4 font-medium">{vend.nome}</td>
                        <td className="p-4 text-center">{vend.comissao_percentual}%</td>
                        <td className="p-4 text-right font-bold text-blue-600">R$ {totalVendido.toFixed(2)}</td>
                        <td className="p-4 text-right font-bold text-green-600 bg-green-50/30">R$ {comissao.toFixed(2)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {mensagem && <p className="mt-4 text-center font-medium text-green-600">{mensagem}</p>}
      </div>
    </main>
  )
}