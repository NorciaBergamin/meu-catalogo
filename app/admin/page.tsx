'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'
import { GoogleGenAI } from '@google/genai'

export default function AdminPanel() {
  // --- SISTEMA DE LOGIN ---
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
    const { data, error } = await supabase.from('pessoas').select('*').eq('tipo', 'vendedor').eq('senha', loginSenha).or(`telefone.eq.${loginUser},nome.eq.${loginUser}`).single()
    if (data) {
      setUsuarioLogado(data)
      setAbaAtiva('pedidos')
    } else {
      setErroLogin('Usuário ou senha incorretos.')
    }
  }

  // --- ESTADOS GERAIS DO SISTEMA ---
  const [abaAtiva, setAbaAtiva] = useState('pedidos')
  const [mensagem, setMensagem] = useState('')
  
  const [categoriasCadastradas, setCategoriasCadastradas] = useState<any[]>([])
  const [listaProdutos, setListaProdutos] = useState<any[]>([])
  const [listaBanners, setListaBanners] = useState<any[]>([])
  const [listaVendedores, setListaVendedores] = useState<any[]>([])
  const [listaClientes, setListaClientes] = useState<any[]>([])
  const [listaPedidos, setListaPedidos] = useState<any[]>([])
  const [desbloqueados, setDesbloqueados] = useState<number[]>([])

  // Estados Produto, Banner, Categoria
  const [nome, setNome] = useState(''); const [preco, setPreco] = useState(''); const [categoria, setCategoria] = useState(''); const [descricao, setDescricao] = useState(''); const [imagemProduto, setImagemProduto] = useState<File | null>(null); const [carregandoProduto, setCarregandoProduto] = useState(false); const [gerandoIA, setGerandoIA] = useState(false)
  const [tituloBanner, setTituloBanner] = useState(''); const [imagemBanner, setImagemBanner] = useState<File | null>(null); const [carregandoBanner, setCarregandoBanner] = useState(false)
  const [novaCategoria, setNovaCategoria] = useState(''); const [carregandoCategoria, setCarregandoCategoria] = useState(false)

  // Estados Vendedor
  const [nomeVendedor, setNomeVendedor] = useState(''); const [telefoneVendedor, setTelefoneVendedor] = useState(''); const [comissaoVendedor, setComissaoVendedor] = useState(''); const [senhaVendedor, setSenhaVendedor] = useState(''); const [idVendedorEdicao, setIdVendedorEdicao] = useState<number | null>(null); const [carregandoVendedor, setCarregandoVendedor] = useState(false)

  // Estados Clientes (CRM)
  const [mostrarFiltrosCli, setMostrarFiltrosCli] = useState(false)
  const [mostrarFormCli, setMostrarFormCli] = useState(false)
  const [idCliEdicao, setIdCliEdicao] = useState<number | null>(null)
  const [cliTipoPessoa, setCliTipoPessoa] = useState('Jurídica'); const [cliRazao, setCliRazao] = useState(''); const [cliFantasia, setCliFantasia] = useState(''); const [cliCpfCnpj, setCliCpfCnpj] = useState(''); const [cliTelefone, setCliTelefone] = useState(''); const [cliCidade, setCliCidade] = useState(''); const [cliEstado, setCliEstado] = useState(''); const [cliRepresentante, setCliRepresentante] = useState(''); const [cliStatusAtivo, setCliStatusAtivo] = useState(true)
  const [filtroCliNome, setFiltroCliNome] = useState(''); const [filtroCliCpf, setFiltroCliCpf] = useState(''); const [filtroCliRep, setFiltroCliRep] = useState(''); const [filtroCliCidade, setFiltroCliCidade] = useState(''); const [filtroCliEstado, setFiltroCliEstado] = useState(''); const [filtroCliStatus, setFiltroCliStatus] = useState('')

  // --- CARREGAMENTO DE DADOS ---
  async function carregarDados() {
    if (!usuarioLogado) return
    const { data: cat } = await supabase.from('categorias').select('*').order('nome')
    if (cat) { setCategoriasCadastradas(cat); if (cat.length > 0 && !categoria) setCategoria(cat[0].nome) }
    
    const { data: prod } = await supabase.from('produtos').select('*').order('id', { ascending: false })
    if (prod) setListaProdutos(prod)
    
    const { data: ban } = await supabase.from('banners').select('*').order('id', { ascending: false })
    if (ban) setListaBanners(ban)

    const { data: vend } = await supabase.from('pessoas').select('*').eq('tipo', 'vendedor').order('nome')
    if (vend) setListaVendedores(usuarioLogado.tipo === 'admin' ? vend : vend.filter(v => v.id === usuarioLogado.id))

    const { data: cli } = await supabase.from('pessoas').select('*').eq('tipo', 'cliente').order('id', { ascending: false })
    if (cli) {
      if (usuarioLogado.tipo === 'admin') setListaClientes(cli)
      else setListaClientes(cli.filter(c => c.representante_id === usuarioLogado.id))
    }

    const { data: ped } = await supabase.from('pedidos').select('*').order('id', { ascending: false })
    if (ped) setListaPedidos(usuarioLogado.tipo === 'admin' ? ped : ped.filter(p => p.vendedor_id === usuarioLogado.id))
  }

  useEffect(() => { carregarDados() }, [usuarioLogado])

  const excluirItem = async (tabela: string, id: number) => {
    if (!confirm(`Tem certeza que deseja excluir este item?`)) return
    const { error } = await supabase.from(tabela).delete().eq('id', id)
    if (!error) { setMensagem('Item excluído!'); carregarDados() }
  }

  // --- FUNÇÕES DE PRODUTOS, BANNERS, CATEGORIAS E VENDEDORES ---
  const gerarDescricaoIA = async () => {
    if (!nome) return setMensagem('Digite o nome do produto primeiro!')
    setGerandoIA(true); setMensagem('IA escrevendo...')
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY })
      const prompt = `Atue como um especialista em marketing. Crie uma descrição comercial curta e altamente persuasiva (máximo de 3 frases) para um produto de e-commerce. O produto é: ${nome}. Categoria: ${categoria}. Foco em atrair o cliente e gerar vendas. Retorne APENAS o texto da descrição.`
      const response = await ai.models.generateContent({ model: 'gemini-3.6-flash', contents: prompt })
      setDescricao(response.text || ''); setMensagem('Descrição gerada!')
    } catch (error) { setMensagem('Erro ao gerar IA.') }
    setGerandoIA(false)
  }

  const handleSalvarProduto = async (e: React.FormEvent) => {
    e.preventDefault(); setCarregandoProduto(true); const precoNumerico = parseFloat(preco.replace(',', '.')); let imagemUrl = ''
    if (imagemProduto) { const ext = imagemProduto.name.split('.').pop(); const nomeArq = `produto_${Math.random()}.${ext}`; await supabase.storage.from('produtos-imagens').upload(nomeArq, imagemProduto); const { data } = supabase.storage.from('produtos-imagens').getPublicUrl(nomeArq); imagemUrl = data.publicUrl }
    const { error } = await supabase.from('produtos').insert([{ nome, preco: precoNumerico, imagem_url: imagemUrl, categoria, descricao }])
    if (!error) { setMensagem('Produto salvo!'); setNome(''); setPreco(''); setDescricao(''); setImagemProduto(null); carregarDados() }
    setCarregandoProduto(false)
  }

  const handleSalvarBanner = async (e: React.FormEvent) => {
    e.preventDefault(); if (!imagemBanner) return; setCarregandoBanner(true); const ext = imagemBanner.name.split('.').pop(); const nomeArq = `banner_${Math.random()}.${ext}`; await supabase.storage.from('produtos-imagens').upload(nomeArq, imagemBanner); const { data } = supabase.storage.from('produtos-imagens').getPublicUrl(nomeArq)
    const { error } = await supabase.from('banners').insert([{ titulo: tituloBanner, imagem_url: data.publicUrl }])
    if (!error) { setMensagem('Banner salvo!'); setTituloBanner(''); setImagemBanner(null); carregarDados() }
    setCarregandoBanner(false)
  }

  const handleSalvarCategoria = async (e: React.FormEvent) => {
    e.preventDefault(); setCarregandoCategoria(true); const { error } = await supabase.from('categorias').insert([{ nome: novaCategoria }])
    if (!error) { setMensagem('Categoria criada!'); setNovaCategoria(''); carregarDados() }
    setCarregandoCategoria(false)
  }

  const iniciarEdicaoVendedor = (vendedor: any) => { setIdVendedorEdicao(vendedor.id); setNomeVendedor(vendedor.nome); setTelefoneVendedor(vendedor.telefone); setComissaoVendedor(vendedor.comissao_percentual.toString()); setSenhaVendedor(vendedor.senha || ''); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const cancelarEdicaoVendedor = () => { setIdVendedorEdicao(null); setNomeVendedor(''); setTelefoneVendedor(''); setComissaoVendedor(''); setSenhaVendedor('') }
  
  const handleSalvarVendedor = async (e: React.FormEvent) => {
    e.preventDefault(); setCarregandoVendedor(true); const comissaoNumerica = parseFloat(comissaoVendedor.replace(',', '.')) || 0
    if (idVendedorEdicao) {
      const { error } = await supabase.from('pessoas').update({ nome: nomeVendedor, telefone: telefoneVendedor, comissao_percentual: comissaoNumerica, senha: senhaVendedor }).eq('id', idVendedorEdicao)
      if (!error) { setMensagem('Vendedor atualizado!'); cancelarEdicaoVendedor(); carregarDados() }
    } else {
      const { error } = await supabase.from('pessoas').insert([{ nome: nomeVendedor, telefone: telefoneVendedor, tipo: 'vendedor', comissao_percentual: comissaoNumerica, senha: senhaVendedor }])
      if (!error) { setMensagem('Vendedor cadastrado!'); cancelarEdicaoVendedor(); carregarDados() }
    }
    setCarregandoVendedor(false)
  }

  // --- FUNÇÕES DE CLIENTES (CRM) ---
  const limparFormCli = () => { setIdCliEdicao(null); setCliRazao(''); setCliFantasia(''); setCliCpfCnpj(''); setCliTelefone(''); setCliCidade(''); setCliEstado(''); setCliRepresentante(''); setCliStatusAtivo(true); setCliTipoPessoa('Jurídica') }
  const iniciarEdicaoCliente = (c: any) => { setIdCliEdicao(c.id); setCliRazao(c.nome); setCliFantasia(c.nome_fantasia || ''); setCliCpfCnpj(c.cpf_cnpj || ''); setCliTelefone(c.telefone || ''); setCliCidade(c.cidade || ''); setCliEstado(c.estado || ''); setCliRepresentante(c.representante_id ? c.representante_id.toString() : ''); setCliStatusAtivo(c.status_ativo); setCliTipoPessoa(c.tipo_pessoa || 'Física'); setMostrarFormCli(true); setMostrarFiltrosCli(false) }

  const handleSalvarCliente = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      nome: cliRazao, nome_fantasia: cliFantasia, cpf_cnpj: cliCpfCnpj, telefone: cliTelefone,
      cidade: cliCidade, estado: cliEstado, tipo_pessoa: cliTipoPessoa, status_ativo: cliStatusAtivo,
      representante_id: cliRepresentante ? parseInt(cliRepresentante) : null, tipo: 'cliente'
    }
    if (idCliEdicao) {
      const { error } = await supabase.from('pessoas').update(payload).eq('id', idCliEdicao)
      if (!error) { setMensagem('Cliente atualizado!'); limparFormCli(); setMostrarFormCli(false); carregarDados() }
    } else {
      const { error } = await supabase.from('pessoas').insert([payload])
      if (!error) { setMensagem('Cliente cadastrado!'); limparFormCli(); setMostrarFormCli(false); carregarDados() }
    }
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

  // --- FUNÇÕES DE PEDIDOS E PDF ---
  const atualizarStatusPedido = async (id: number, novoStatus: string) => {
    const { error } = await supabase.from('pedidos').update({ status: novoStatus }).eq('id', id)
    if (!error) { setMensagem(`Pedido #${id} atualizado para "${novoStatus}"`); carregarDados() }
  }

  const desbloquearPedido = (id: number) => {
    if (usuarioLogado.tipo !== 'admin') return alert('Apenas o Administrador pode desbloquear pedidos.')
    const senha = prompt('Acesso Restrito: Digite a senha do ADM para desbloquear (admin123)')
    if (senha === 'admin123') setDesbloqueados([...desbloqueados, id])
    else if (senha !== null) alert('Senha incorreta!')
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
      const htmlPdf = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h1 style="color: #2563eb; text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">Pedido de Venda #${pedido.id} (2ª Via)</h1>
          <div style="display: flex; justify-content: space-between; margin-bottom: 20px; margin-top: 20px;">
            <div style="width: 48%; padding: 15px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px;">
              <h3 style="margin-top: 0; color: #1f2937; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Dados do Cliente</h3>
              <p style="margin: 5px 0;"><strong>Nome:</strong> ${cliente?.nome || 'Desconhecido'}</p>
              <p style="margin: 5px 0;"><strong>Telefone:</strong> ${cliente?.telefone || '-'}</p>
            </div>
            <div style="width: 48%; padding: 15px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px;">
              <h3 style="margin-top: 0; color: #1f2937; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Dados do Vendedor</h3>
              <p style="margin: 5px 0;"><strong>Responsável:</strong> ${vendedor?.nome || 'Não informado'}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> ${pedido.status}</p>
            </div>
          </div>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr style="background-color: #2563eb; color: white;">
                <th style="padding: 12px; text-align: left;">Produto</th><th style="padding: 12px; text-align: center;">Qtd</th>
                <th style="padding: 12px; text-align: right;">V. Unitário</th><th style="padding: 12px; text-align: right;">Subtotal</th>
              </tr>
            </thead>
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
        linhasTabela += `
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 12px;">${vend.nome}</td><td style="padding: 12px; text-align: center;">${vend.comissao_percentual}%</td>
            <td style="padding: 12px; text-align: right;">R$ ${totalVendido.toFixed(2)}</td>
            <td style="padding: 12px; text-align: right; color: #166534; font-weight: bold;">R$ ${valorComissao.toFixed(2)}</td>
          </tr>
        `
      })
      const htmlPdf = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h1 style="color: #9333ea; text-align: center; border-bottom: 2px solid #9333ea; padding-bottom: 10px;">Fechamento de Comissões</h1>
          <table style="width: 100%; border-collapse: collapse; margin-top: 30px;">
            <thead style="background-color: #f3f4f6;"><tr><th style="padding: 12px; text-align: left;">Vendedor</th><th style="padding: 12px;">Taxa (%)</th><th style="padding: 12px; text-align: right;">Total Vendido</th><th style="padding: 12px; text-align: right;">Comissão a Pagar</th></tr></thead>
            <tbody>${linhasTabela}</tbody>
          </table>
          <div style="margin-top: 40px; padding: 20px; background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
            <div style="display: flex; justify-content: space-between; font-size: 16px;"><span>Total Vendido Bruto:</span><strong>R$ ${totalGeralVendido.toFixed(2)}</strong></div>
            <div style="display: flex; justify-content: space-between; font-size: 20px; margin-top: 15px; color: #9333ea;"><span>Total de Comissões a Pagar:</span><strong>R$ ${totalGeralComissao.toFixed(2)}</strong></div>
          </div>
        </div>
      `
      const opcoesPdf: any = { margin: 10, filename: `relatorio_comissoes.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } }
      await html2pdf().set(opcoesPdf).from(htmlPdf).save()
      setMensagem('PDF do relatório gerado com sucesso!')
    } catch (error: any) { setMensagem(`Erro ao gerar PDF: ${error.message}`) }
  }

  // --- TELA DE LOGIN ---
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

  // --- TELA DO PAINEL ---
  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-50 text-gray-900">
      <div className="max-w-[1400px] mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        
        {/* CABEÇALHO E MENU */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold uppercase text-gray-700">{abaAtiva}</h1>
            <p className="text-sm text-gray-500">Logado como: <strong className="text-blue-600">{usuarioLogado.nome}</strong></p>
          </div>
          <button onClick={() => setUsuarioLogado(null)} className="text-sm bg-gray-100 hover:bg-red-100 text-gray-700 font-bold py-2 px-4 rounded-lg">Sair</button>
        </div>

        <div className="flex flex-wrap border-b border-gray-200 mb-6 text-sm">
          {usuarioLogado.tipo === 'admin' && (
            <>
              <button onClick={() => setAbaAtiva('produto')} className={`flex-1 py-3 font-semibold ${abaAtiva === 'produto' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}>Produtos</button>
              <button onClick={() => setAbaAtiva('banner')} className={`flex-1 py-3 font-semibold ${abaAtiva === 'banner' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}>Banners</button>
              <button onClick={() => setAbaAtiva('categoria')} className={`flex-1 py-3 font-semibold ${abaAtiva === 'categoria' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}>Categorias</button>
              <button onClick={() => setAbaAtiva('vendedor')} className={`flex-1 py-3 font-semibold ${abaAtiva === 'vendedor' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500 hover:bg-gray-50'}`}>Vendedores</button>
            </>
          )}
          <button onClick={() => setAbaAtiva('clientes')} className={`flex-1 py-3 font-semibold ${abaAtiva === 'clientes' ? 'border-b-2 border-teal-500 text-teal-600' : 'text-gray-500 hover:bg-gray-50'}`}>Clientes</button>
          <button onClick={() => setAbaAtiva('pedidos')} className={`flex-1 py-3 font-semibold ${abaAtiva === 'pedidos' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500 hover:bg-gray-50'}`}>Gestão de Pedidos</button>
          <button onClick={() => setAbaAtiva('relatorio')} className={`flex-1 py-3 font-semibold ${abaAtiva === 'relatorio' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-500 hover:bg-gray-50'}`}>Relatórios</button>
        </div>

        {/* --- ABA PRODUTOS --- */}
        {abaAtiva === 'produto' && usuarioLogado.tipo === 'admin' && (
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSalvarProduto} className="space-y-4 mb-8">
              <div><label className="block text-sm font-medium mb-1">Nome</label><input type="text" required value={nome} onChange={(e) => setNome(e.target.value)} className="w-full p-2 border rounded-md" /></div>
              <div className="flex gap-4">
                <div className="w-1/2"><label className="block text-sm font-medium mb-1">Preço (R$)</label><input type="text" required value={preco} onChange={(e) => setPreco(e.target.value)} className="w-full p-2 border rounded-md" /></div>
                <div className="w-1/2">
                  <label className="block text-sm font-medium mb-1">Categoria</label>
                  <select required value={categoria} onChange={(e) => setCategoria(e.target.value)} className="w-full p-2 border rounded-md bg-white">
                    {categoriasCadastradas.map(cat => <option key={cat.id} value={cat.nome}>{cat.nome}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <label className="block text-sm font-medium">Descrição</label>
                  <button type="button" onClick={gerarDescricaoIA} disabled={gerandoIA || !nome} className="text-xs bg-purple-100 text-purple-700 font-bold px-2 py-1 rounded">✨ Gerar com IA</button>
                </div>
                <textarea rows={3} value={descricao} onChange={(e) => setDescricao(e.target.value)} className="w-full p-2 border rounded-md text-sm" />
              </div>
              <div><label className="block text-sm font-medium mb-1">Foto</label><input type="file" accept="image/*" onChange={(e) => setImagemProduto(e.target.files?.[0] || null)} className="w-full p-2 border rounded-md" /></div>
              <button type="submit" disabled={carregandoProduto} className="w-full bg-blue-600 text-white font-bold py-2 rounded-md">Salvar Produto</button>
            </form>
            <h3 className="font-bold border-b pb-2 mb-4">Produtos Cadastrados</h3>
            <ul className="space-y-2">
              {listaProdutos.map(p => (
                <li key={p.id} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                  <span>{p.nome} - R$ {p.preco}</span>
                  <button onClick={() => excluirItem('produtos', p.id)} className="text-red-500 font-bold hover:underline">Excluir</button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* --- ABA BANNERS --- */}
        {abaAtiva === 'banner' && usuarioLogado.tipo === 'admin' && (
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSalvarBanner} className="space-y-4 mb-8">
              <div><label className="block text-sm mb-1">Título</label><input type="text" required value={tituloBanner} onChange={(e) => setTituloBanner(e.target.value)} className="w-full p-2 border rounded-md" /></div>
              <div><label className="block text-sm mb-1">Imagem</label><input type="file" required accept="image/*" onChange={(e) => setImagemBanner(e.target.files?.[0] || null)} className="w-full p-2 border rounded-md" /></div>
              <button type="submit" disabled={carregandoBanner} className="w-full bg-blue-600 text-white font-bold py-2 rounded-md">Publicar Banner</button>
            </form>
            <h3 className="font-bold border-b pb-2 mb-4">Banners Cadastrados</h3>
            <ul className="space-y-2">
              {listaBanners.map(b => (
                <li key={b.id} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                  <span>{b.titulo}</span>
                  <button onClick={() => excluirItem('banners', b.id)} className="text-red-500 font-bold hover:underline">Excluir</button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* --- ABA CATEGORIAS --- */}
        {abaAtiva === 'categoria' && usuarioLogado.tipo === 'admin' && (
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSalvarCategoria} className="space-y-4 mb-8">
              <div><label className="block text-sm font-medium mb-1">Nova Categoria</label><input type="text" required value={novaCategoria} onChange={(e) => setNovaCategoria(e.target.value)} className="w-full p-2 border rounded-md" /></div>
              <button type="submit" disabled={carregandoCategoria} className="w-full bg-blue-600 text-white font-bold py-2 rounded-md">Salvar Categoria</button>
            </form>
            <h3 className="font-bold border-b pb-2 mb-4">Categorias Atuais</h3>
            <ul className="space-y-2 text-sm">
              {categoriasCadastradas.map(c => (
                <li key={c.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                  <span>{c.nome}</span>
                  <button onClick={() => excluirItem('categorias', c.id)} className="text-red-500 font-bold hover:underline">Excluir</button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* --- ABA VENDEDORES --- */}
        {abaAtiva === 'vendedor' && usuarioLogado.tipo === 'admin' && (
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSalvarVendedor} className={`space-y-4 mb-8 p-4 rounded-xl border ${idVendedorEdicao ? 'bg-blue-50/30 border-blue-200' : 'bg-green-50/30 border-green-100'}`}>
              {idVendedorEdicao && <div className="text-blue-600 font-bold text-sm mb-2">Editando Vendedor</div>}
              <div>
                <label className="block text-sm font-medium mb-1">Nome do Vendedor</label>
                <input type="text" required value={nomeVendedor} onChange={(e) => setNomeVendedor(e.target.value)} className="w-full p-2 border rounded-md" />
              </div>
              <div className="flex gap-4">
                <div className="w-1/3">
                  <label className="block text-sm font-medium mb-1">Telefone / Usuário</label>
                  <input type="text" required value={telefoneVendedor} onChange={(e) => setTelefoneVendedor(e.target.value)} className="w-full p-2 border rounded-md" />
                </div>
                <div className="w-1/3">
                  <label className="block text-sm font-medium mb-1">Senha</label>
                  <input type="text" required value={senhaVendedor} onChange={(e) => setSenhaVendedor(e.target.value)} className="w-full p-2 border rounded-md" placeholder="Senha de acesso" />
                </div>
                <div className="w-1/3">
                  <label className="block text-sm font-medium mb-1">Comissão (%)</label>
                  <input type="number" step="0.1" required value={comissaoVendedor} onChange={(e) => setComissaoVendedor(e.target.value)} className="w-full p-2 border rounded-md" />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={carregandoVendedor} className={`flex-1 text-white font-bold py-2 rounded-md transition-colors ${idVendedorEdicao ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}>
                  {idVendedorEdicao ? 'Salvar Alterações' : 'Cadastrar Vendedor'}
                </button>
                {idVendedorEdicao && (
                  <button type="button" onClick={cancelarEdicaoVendedor} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-md transition-colors">Cancelar</button>
                )}
              </div>
            </form>
            <h3 className="font-bold border-b pb-2 mb-4">Equipe de Vendas</h3>
            <ul className="space-y-2 text-sm">
              {listaVendedores.map(v => (
                <li key={v.id} className="flex justify-between items-center bg-gray-50 p-3 rounded border border-gray-100">
                  <div>
                    <strong>{v.nome}</strong> <span className="text-gray-500">({v.telefone})</span> - Senha: {v.senha}
                    <p className="text-green-700 font-semibold text-xs mt-1">Comissão: {v.comissao_percentual}%</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => iniciarEdicaoVendedor(v)} className="text-blue-500 font-bold hover:underline">Editar</button>
                    <button onClick={() => excluirItem('pessoas', v.id)} className="text-red-500 font-bold hover:underline">Excluir</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* --- ABA CLIENTES (CRM) --- */}
        {abaAtiva === 'clientes' && (
          <div>
            <div className="flex gap-2 mb-6">
              <button onClick={() => { limparFormCli(); setMostrarFormCli(!mostrarFormCli); setMostrarFiltrosCli(false) }} className="bg-teal-400 hover:bg-teal-500 text-white font-bold py-2 px-4 rounded shadow-sm text-sm flex items-center gap-1">
                + Adicionar
              </button>
              <button onClick={() => { setMostrarFiltrosCli(!mostrarFiltrosCli); setMostrarFormCli(false) }} className="bg-blue-400 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded shadow-sm text-sm flex items-center gap-1">
                Y Filtrar
              </button>
            </div>

            {mostrarFiltrosCli && (
              <div className="bg-gray-50 p-4 border border-gray-200 rounded-md mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2"><label className="w-1/3 text-right text-gray-600">Razão Social/Fantasia</label><input type="text" value={filtroCliNome} onChange={e=>setFiltroCliNome(e.target.value)} className="w-2/3 p-2 border rounded" placeholder="Título" /></div>
                <div className="flex items-center gap-2"><label className="w-1/3 text-right text-gray-600">CNPJ / CPF</label><input type="text" value={filtroCliCpf} onChange={e=>setFiltroCliCpf(e.target.value)} className="w-2/3 p-2 border rounded" placeholder="CNPJ / CPF" /></div>
                <div className="flex items-center gap-2">
                  <label className="w-1/3 text-right text-gray-600">Representante</label>
                  <select value={filtroCliRep} onChange={e=>setFiltroCliRep(e.target.value)} className="w-2/3 p-2 border rounded bg-white">
                    <option value="">Qualquer</option>{listaVendedores.map(v => <option key={v.id} value={v.id}>{v.nome}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2"><label className="w-1/3 text-right text-gray-600">Cidade</label><input type="text" value={filtroCliCidade} onChange={e=>setFiltroCliCidade(e.target.value)} className="w-2/3 p-2 border rounded" placeholder="Cidade" /></div>
                <div className="flex items-center gap-2">
                  <label className="w-1/3 text-right text-gray-600">Estado</label>
                  <select value={filtroCliEstado} onChange={e=>setFiltroCliEstado(e.target.value)} className="w-2/3 p-2 border rounded bg-white">
                    <option value="">Qualquer</option><option value="PR">PR</option><option value="SP">SP</option><option value="SC">SC</option><option value="RS">RS</option><option value="MT">MT</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="w-1/3 text-right text-gray-600">Situação</label>
                  <select value={filtroCliStatus} onChange={e=>setFiltroCliStatus(e.target.value)} className="w-2/3 p-2 border rounded bg-white">
                    <option value="">Qualquer</option><option value="true">Ativo</option><option value="false">Inativo</option>
                  </select>
                </div>
                <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                  <button onClick={limparFiltrosCli} className="bg-red-400 text-white px-4 py-2 rounded font-bold">Limpar</button>
                </div>
              </div>
            )}

            {mostrarFormCli && (
              <form onSubmit={handleSalvarCliente} className="bg-white p-6 border border-teal-200 rounded-md mb-6 shadow-sm text-sm">
                <h3 className="font-bold text-teal-700 mb-4 text-lg border-b pb-2">{idCliEdicao ? 'Editar Cliente' : 'Novo Cliente'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div><label className="block text-gray-600 mb-1">Tipo Pessoa</label><select value={cliTipoPessoa} onChange={e=>setCliTipoPessoa(e.target.value)} className="w-full p-2 border rounded bg-white"><option>Física</option><option>Jurídica</option></select></div>
                  <div className="md:col-span-2"><label className="block text-gray-600 mb-1">Razão Social / Nome</label><input type="text" required value={cliRazao} onChange={e=>setCliRazao(e.target.value)} className="w-full p-2 border rounded" /></div>
                  <div className="md:col-span-2"><label className="block text-gray-600 mb-1">Nome Fantasia</label><input type="text" value={cliFantasia} onChange={e=>setCliFantasia(e.target.value)} className="w-full p-2 border rounded" /></div>
                  <div><label className="block text-gray-600 mb-1">CPF / CNPJ</label><input type="text" value={cliCpfCnpj} onChange={e=>setCliCpfCnpj(e.target.value)} className="w-full p-2 border rounded" /></div>
                  <div><label className="block text-gray-600 mb-1">Telefone/Celular</label><input type="text" value={cliTelefone} onChange={e=>setCliTelefone(e.target.value)} className="w-full p-2 border rounded" /></div>
                  <div><label className="block text-gray-600 mb-1">Cidade</label><input type="text" value={cliCidade} onChange={e=>setCliCidade(e.target.value)} className="w-full p-2 border rounded" /></div>
                  <div>
                    <label className="block text-gray-600 mb-1">Estado</label>
                    <select value={cliEstado} onChange={e=>setCliEstado(e.target.value)} className="w-full p-2 border rounded bg-white">
                      <option value="">Selecione</option><option value="PR">PR</option><option value="SP">SP</option><option value="SC">SC</option><option value="RS">RS</option><option value="MT">MT</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Representante</label>
                    <select value={cliRepresentante} onChange={e=>setCliRepresentante(e.target.value)} className="w-full p-2 border rounded bg-white">
                      <option value="">Nenhum</option>{listaVendedores.map(v => <option key={v.id} value={v.id}>{v.nome}</option>)}
                    </select>
                  </div>
                  <div className="flex items-end pb-2">
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={cliStatusAtivo} onChange={e=>setCliStatusAtivo(e.target.checked)} className="w-4 h-4" /> <span className="text-gray-600 font-bold">Cliente Ativo</span></label>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={() => setMostrarFormCli(false)} className="bg-gray-300 px-4 py-2 rounded font-bold">Cancelar</button>
                  <button type="submit" className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded font-bold">Salvar Cliente</button>
                </div>
              </form>
            )}

            <div className="overflow-x-auto border border-gray-200 shadow-sm">
              <table className="w-full text-xs text-left whitespace-nowrap">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                  <tr>
                    <th className="p-3 border-r">Código</th><th className="p-3 border-r">Tipo</th><th className="p-3 border-r">Razão / Nome</th>
                    <th className="p-3 border-r">Fantasia</th><th className="p-3 border-r">Representante</th><th className="p-3 border-r">Cidade</th>
                    <th className="p-3 border-r">Estado</th><th className="p-3 border-r">Telefone/Celular</th><th className="p-3 border-r text-center">Pedidos</th>
                    <th className="p-3 border-r">Data Cad.</th><th className="p-3 border-r text-center">Status</th><th className="p-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {clientesFiltrados.map(c => {
                    const rep = listaVendedores.find(v => v.id === c.representante_id)
                    const numPedidos = listaPedidos.filter(p => p.cliente_id === c.id).length
                    const dataCad = new Date(c.data_cadastro).toLocaleDateString('pt-BR')
                    return (
                      <tr key={c.id} className="hover:bg-gray-50 text-gray-700">
                        <td className="p-3 border-r">{c.id}</td><td className="p-3 border-r">{c.tipo_pessoa}</td>
                        <td className="p-3 border-r font-medium max-w-[200px] truncate" title={c.nome}>{c.nome}</td>
                        <td className="p-3 border-r truncate max-w-[150px]">{c.nome_fantasia}</td><td className="p-3 border-r">{rep ? rep.nome : '-'}</td>
                        <td className="p-3 border-r">{c.cidade}</td><td className="p-3 border-r">{c.estado}</td><td className="p-3 border-r">{c.telefone}</td>
                        <td className="p-3 border-r text-center font-bold">{numPedidos}</td><td className="p-3 border-r">{dataCad}</td>
                        <td className="p-3 border-r text-center">{c.status_ativo ? <span className="bg-green-500 text-white px-2 py-1 rounded text-[10px] font-bold">✔</span> : <span className="bg-red-500 text-white px-2 py-1 rounded text-[10px] font-bold">✖</span>}</td>
                        <td className="p-3 text-center flex justify-center gap-1">
                          <button onClick={() => iniciarEdicaoCliente(c)} className="bg-green-500 text-white p-1.5 rounded hover:bg-green-600" title="Editar">📝</button>
                          {usuarioLogado.tipo === 'admin' && (
                            <button onClick={() => excluirItem('pessoas', c.id)} className="bg-red-400 text-white p-1.5 rounded hover:bg-red-500" title="Excluir">✖</button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                  {clientesFiltrados.length === 0 && (<tr><td colSpan={12} className="p-6 text-center text-gray-500">Nenhum cliente encontrado.</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- ABA PEDIDOS --- */}
        {abaAtiva === 'pedidos' && (
          <div>
            <h3 className="font-bold text-xl mb-1">Controle de Pedidos</h3>
            <p className="text-sm text-gray-500 border-b pb-4 mb-6">
              {usuarioLogado.tipo === 'admin' ? 'Acompanhe todos os pedidos realizados na loja.' : 'Acompanhe exclusivamente os pedidos vinculados ao seu usuário.'}
            </p>
            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="p-3 font-semibold border-b">Cód.</th><th className="p-3 font-semibold border-b">Data</th>
                    <th className="p-3 font-semibold border-b">Cliente</th><th className="p-3 font-semibold border-b">Representante</th>
                    <th className="p-3 font-semibold border-b text-right">Total (R$)</th><th className="p-3 font-semibold border-b text-center">Status</th>
                    <th className="p-3 font-semibold border-b text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {listaPedidos.map(pedido => {
                    const cliente = listaClientes.find(c => c.id === pedido.cliente_id)
                    const vendedor = listaVendedores.find(v => v.id === pedido.vendedor_id)
                    const estaBloqueado = pedido.status === 'Concluído' && !desbloqueados.includes(pedido.id)
                    return (
                      <tr key={pedido.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3 text-gray-900 font-bold">#{pedido.id}</td><td className="p-3 text-gray-600">{new Date(pedido.data_pedido).toLocaleDateString('pt-BR')}</td>
                        <td className="p-3 text-gray-900 font-medium">{cliente?.nome || 'Desconhecido'} <span className="text-xs text-gray-500 block">{cliente?.telefone}</span></td>
                        <td className="p-3 text-gray-600">{vendedor?.nome || '-'}</td><td className="p-3 text-right font-bold text-green-700">R$ {Number(pedido.valor_total).toFixed(2)}</td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <select value={pedido.status} disabled={estaBloqueado} onChange={(e) => atualizarStatusPedido(pedido.id, e.target.value)} className={`text-xs font-bold py-1 px-2 rounded-full border outline-none ${estaBloqueado ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'} ${pedido.status === 'Pendente' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : pedido.status === 'Em Produção' ? 'bg-blue-100 text-blue-800 border-blue-200' : pedido.status === 'Despachado' ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-green-100 text-green-800 border-green-200'}`}>
                              <option value="Pendente">Pendente</option><option value="Em Produção">Em Produção</option><option value="Despachado">Despachado</option><option value="Concluído">Concluído</option>
                            </select>
                            {estaBloqueado && usuarioLogado.tipo === 'admin' && (<button onClick={() => desbloquearPedido(pedido.id)} className="text-gray-400 hover:text-gray-700">🔒</button>)}
                          </div>
                        </td>
                        <td className="p-3 text-center flex items-center justify-center gap-2">
                          <button onClick={() => reimprimirPedido(pedido)} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold">PDF</button>
                          {usuarioLogado.tipo === 'admin' && (<button onClick={() => excluirItem('pedidos', pedido.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-bold">Excluir</button>)}
                        </td>
                      </tr>
                    )
                  })}
                  {listaPedidos.length === 0 && (<tr><td colSpan={7} className="p-8 text-center text-gray-500 italic">Nenhum pedido encontrado.</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- ABA RELATÓRIOS --- */}
        {abaAtiva === 'relatorio' && (
          <div>
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-bold text-xl">Fechamento de Comissões</h3>
              <button onClick={gerarRelatorioPDF} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md text-sm flex items-center gap-2 transition-colors shadow-sm">
                📄 Baixar PDF
              </button>
            </div>
            <p className="text-sm text-gray-500 border-b pb-4 mb-6">Relatório em tempo real das vendas realizadas e comissões geradas por cada vendedor.</p>
            <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="p-4 font-semibold">Vendedor</th><th className="p-4 font-semibold text-center">Taxa (%)</th>
                    <th className="p-4 font-semibold text-right">Total Vendido</th><th className="p-4 font-semibold text-right text-purple-700">Comissão a Pagar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {listaVendedores.map(vend => {
                    const pedidosDesteVendedor = listaPedidos.filter(p => p.vendedor_id === vend.id)
                    const totalVendido = pedidosDesteVendedor.reduce((acc, pedido) => acc + Number(pedido.valor_total), 0)
                    const valorComissao = totalVendido * (vend.comissao_percentual / 100)
                    return (
                      <tr key={vend.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-medium text-gray-900">{vend.nome}</td><td className="p-4 text-center text-gray-600">{vend.comissao_percentual}%</td>
                        <td className="p-4 text-right text-blue-600 font-bold">R$ {totalVendido.toFixed(2)}</td><td className="p-4 text-right text-green-600 font-bold bg-green-50/30">R$ {valorComissao.toFixed(2)}</td>
                      </tr>
                    )
                  })}
                  {listaVendedores.length === 0 && (<tr><td colSpan={4} className="p-8 text-center text-gray-500 italic">Nenhum vendedor encontrado.</td></tr>)}
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