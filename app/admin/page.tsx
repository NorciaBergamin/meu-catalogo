'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'
import { GoogleGenAI } from '@google/genai'

export default function AdminPanel() {
  const [abaAtiva, setAbaAtiva] = useState('produto')
  const [mensagem, setMensagem] = useState('')
  
  const [categoriasCadastradas, setCategoriasCadastradas] = useState<any[]>([])
  const [listaProdutos, setListaProdutos] = useState<any[]>([])
  const [listaBanners, setListaBanners] = useState<any[]>([])
  const [listaVendedores, setListaVendedores] = useState<any[]>([])
  const [listaPedidos, setListaPedidos] = useState<any[]>([])

  async function carregarDados() {
    const { data: cat } = await supabase.from('categorias').select('*').order('nome')
    if (cat) {
      setCategoriasCadastradas(cat)
      if (cat.length > 0 && !categoria) setCategoria(cat[0].nome)
    }
    const { data: prod } = await supabase.from('produtos').select('*').order('id', { ascending: false })
    if (prod) setListaProdutos(prod)
    
    const { data: ban } = await supabase.from('banners').select('*').order('id', { ascending: false })
    if (ban) setListaBanners(ban)

    const { data: vend } = await supabase.from('pessoas').select('*').eq('tipo', 'vendedor').order('nome')
    if (vend) setListaVendedores(vend)

    const { data: ped } = await supabase.from('pedidos').select('*').order('data_pedido', { ascending: false })
    if (ped) setListaPedidos(ped)
  }

  useEffect(() => {
    carregarDados()
  }, [])

  // Estados Produto
  const [nome, setNome] = useState('')
  const [preco, setPreco] = useState('')
  const [categoria, setCategoria] = useState('')
  const [descricao, setDescricao] = useState('')
  const [imagemProduto, setImagemProduto] = useState<File | null>(null)
  const [carregandoProduto, setCarregandoProduto] = useState(false)
  const [gerandoIA, setGerandoIA] = useState(false)

  // Estados Banner & Categoria
  const [tituloBanner, setTituloBanner] = useState('')
  const [imagemBanner, setImagemBanner] = useState<File | null>(null)
  const [carregandoBanner, setCarregandoBanner] = useState(false)
  const [novaCategoria, setNovaCategoria] = useState('')
  const [carregandoCategoria, setCarregandoCategoria] = useState(false)

  // Estados Vendedor
  const [nomeVendedor, setNomeVendedor] = useState('')
  const [telefoneVendedor, setTelefoneVendedor] = useState('')
  const [comissaoVendedor, setComissaoVendedor] = useState('')
  const [idVendedorEdicao, setIdVendedorEdicao] = useState<number | null>(null)
  const [carregandoVendedor, setCarregandoVendedor] = useState(false)

  const excluirItem = async (tabela: string, id: number) => {
    if (!confirm(`Tem certeza que deseja excluir este item?`)) return
    const { error } = await supabase.from(tabela).delete().eq('id', id)
    if (error) setMensagem(`Erro ao excluir: ${error.message}`)
    else {
      setMensagem('Item excluído com sucesso!')
      carregarDados()
    }
  }

  const gerarDescricaoIA = async () => {
    if (!nome) return setMensagem('Digite o nome do produto primeiro!')
    setGerandoIA(true)
    setMensagem('IA escrevendo...')
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY })
      const prompt = `Atue como um especialista em marketing. Crie uma descrição comercial curta e altamente persuasiva (máximo de 3 frases) para um produto de e-commerce. O produto é: ${nome}. Categoria: ${categoria}. Foco em atrair o cliente e gerar vendas. Retorne APENAS o texto da descrição.`
      const response = await ai.models.generateContent({ model: 'gemini-3.6-flash', contents: prompt })
      setDescricao(response.text || '')
      setMensagem('Descrição gerada!')
    } catch (error) {
      setMensagem('Erro ao gerar IA.')
    }
    setGerandoIA(false)
  }

  const handleSalvarProduto = async (e: React.FormEvent) => {
    e.preventDefault()
    setCarregandoProduto(true)
    const precoNumerico = parseFloat(preco.replace(',', '.'))
    let imagemUrl = ''
    if (imagemProduto) {
      const ext = imagemProduto.name.split('.').pop()
      const nomeArq = `produto_${Math.random()}.${ext}`
      await supabase.storage.from('produtos-imagens').upload(nomeArq, imagemProduto)
      const { data } = supabase.storage.from('produtos-imagens').getPublicUrl(nomeArq)
      imagemUrl = data.publicUrl
    }
    const { error } = await supabase.from('produtos').insert([{ nome, preco: precoNumerico, imagem_url: imagemUrl, categoria, descricao }])
    if (!error) { setMensagem('Produto salvo!'); setNome(''); setPreco(''); setDescricao(''); setImagemProduto(null); carregarDados() }
    setCarregandoProduto(false)
  }

  const handleSalvarBanner = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imagemBanner) return setMensagem('Selecione uma imagem')
    setCarregandoBanner(true)
    const ext = imagemBanner.name.split('.').pop()
    const nomeArq = `banner_${Math.random()}.${ext}`
    await supabase.storage.from('produtos-imagens').upload(nomeArq, imagemBanner)
    const { data } = supabase.storage.from('produtos-imagens').getPublicUrl(nomeArq)
    const { error } = await supabase.from('banners').insert([{ titulo: tituloBanner, imagem_url: data.publicUrl }])
    if (!error) { setMensagem('Banner salvo!'); setTituloBanner(''); setImagemBanner(null); carregarDados() }
    setCarregandoBanner(false)
  }

  const handleSalvarCategoria = async (e: React.FormEvent) => {
    e.preventDefault()
    setCarregandoCategoria(true)
    const { error } = await supabase.from('categorias').insert([{ nome: novaCategoria }])
    if (!error) { setMensagem('Categoria criada!'); setNovaCategoria(''); carregarDados() }
    setCarregandoCategoria(false)
  }

  const iniciarEdicaoVendedor = (vendedor: any) => {
    setIdVendedorEdicao(vendedor.id)
    setNomeVendedor(vendedor.nome)
    setTelefoneVendedor(vendedor.telefone)
    setComissaoVendedor(vendedor.comissao_percentual.toString())
    setMensagem('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelarEdicaoVendedor = () => {
    setIdVendedorEdicao(null)
    setNomeVendedor('')
    setTelefoneVendedor('')
    setComissaoVendedor('')
    setMensagem('')
  }

  const handleSalvarVendedor = async (e: React.FormEvent) => {
    e.preventDefault()
    setCarregandoVendedor(true)
    const comissaoNumerica = parseFloat(comissaoVendedor.replace(',', '.')) || 0
    
    if (idVendedorEdicao) {
      const { error } = await supabase.from('pessoas').update({ 
        nome: nomeVendedor, 
        telefone: telefoneVendedor, 
        comissao_percentual: comissaoNumerica 
      }).eq('id', idVendedorEdicao)
      
      if (!error) {
        setMensagem('Vendedor atualizado com sucesso!')
        cancelarEdicaoVendedor()
        carregarDados()
      } else {
        setMensagem(`Erro: ${error.message}`)
      }
    } else {
      const { error } = await supabase.from('pessoas').insert([{ 
        nome: nomeVendedor, 
        telefone: telefoneVendedor, 
        tipo: 'vendedor',
        comissao_percentual: comissaoNumerica 
      }])
      
      if (!error) {
        setMensagem('Vendedor cadastrado com sucesso!')
        setNomeVendedor(''); setTelefoneVendedor(''); setComissaoVendedor(''); carregarDados()
      } else {
        setMensagem(`Erro: ${error.message}`)
      }
    }
    setCarregandoVendedor(false)
  }

  // --- NOVA FUNÇÃO: GERAR RELATÓRIO PDF ---
  const gerarRelatorioPDF = async () => {
    setMensagem('Gerando PDF do relatório...')
    try {
      // @ts-ignore
      const html2pdf = (await import('html2pdf.js')).default

      let linhasTabela = ''
      let totalGeralVendido = 0
      let totalGeralComissao = 0

      listaVendedores.forEach(vend => {
        const pedidosDesteVendedor = listaPedidos.filter(p => p.vendedor_id === vend.id)
        const totalVendido = pedidosDesteVendedor.reduce((acc, pedido) => acc + Number(pedido.valor_total), 0)
        const valorComissao = totalVendido * (vend.comissao_percentual / 100)

        totalGeralVendido += totalVendido
        totalGeralComissao += valorComissao

        linhasTabela += `
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 12px;">${vend.nome}</td>
            <td style="padding: 12px; text-align: center;">${vend.comissao_percentual}%</td>
            <td style="padding: 12px; text-align: right;">R$ ${totalVendido.toFixed(2)}</td>
            <td style="padding: 12px; text-align: right; color: #166534; font-weight: bold;">R$ ${valorComissao.toFixed(2)}</td>
          </tr>
        `
      })

      const dataAtual = new Date().toLocaleDateString('pt-BR')

      const htmlPdf = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h1 style="color: #9333ea; text-align: center; border-bottom: 2px solid #9333ea; padding-bottom: 10px;">Fechamento de Comissões</h1>
          <p style="text-align: center; color: #666;">Relatório gerado em ${dataAtual}</p>

          <table style="width: 100%; border-collapse: collapse; margin-top: 30px;">
            <thead>
              <tr style="background-color: #f3f4f6; color: #374151;">
                <th style="padding: 12px; text-align: left;">Vendedor</th>
                <th style="padding: 12px; text-align: center;">Taxa (%)</th>
                <th style="padding: 12px; text-align: right;">Total Vendido</th>
                <th style="padding: 12px; text-align: right;">Comissão a Pagar</th>
              </tr>
            </thead>
            <tbody>
              ${linhasTabela}
              ${listaVendedores.length === 0 ? '<tr><td colspan="4" style="text-align:center; padding: 20px;">Nenhum vendedor encontrado.</td></tr>' : ''}
            </tbody>
          </table>

          <div style="margin-top: 40px; padding: 20px; background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
            <h3 style="margin-top: 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; color: #374151;">Resumo Geral da Loja</h3>
            <div style="display: flex; justify-content: space-between; font-size: 16px; margin-top: 15px;">
              <span>Total Vendido Bruto:</span>
              <strong>R$ ${totalGeralVendido.toFixed(2)}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 20px; margin-top: 15px; color: #9333ea;">
              <span>Total de Comissões a Pagar:</span>
              <strong>R$ ${totalGeralComissao.toFixed(2)}</strong>
            </div>
          </div>
        </div>
      `

      const opcoesPdf: any = {
        margin: 10,
        filename: `relatorio_comissoes_${new Date().getTime()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }

      await html2pdf().set(opcoesPdf).from(htmlPdf).save()
      setMensagem('PDF do relatório gerado e baixado com sucesso!')
    } catch (error: any) {
      setMensagem(`Erro ao gerar PDF: ${error.message}`)
    }
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50 text-gray-900">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        
        <div className="flex flex-wrap border-b border-gray-200 mb-6 text-sm">
          <button onClick={() => { setAbaAtiva('produto'); setMensagem(''); }} className={`flex-1 py-3 font-semibold min-w-[100px] transition-colors ${abaAtiva === 'produto' ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/30' : 'text-gray-500 hover:bg-gray-50'}`}>Produtos</button>
          <button onClick={() => { setAbaAtiva('banner'); setMensagem(''); }} className={`flex-1 py-3 font-semibold min-w-[100px] transition-colors ${abaAtiva === 'banner' ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/30' : 'text-gray-500 hover:bg-gray-50'}`}>Banners</button>
          <button onClick={() => { setAbaAtiva('categoria'); setMensagem(''); }} className={`flex-1 py-3 font-semibold min-w-[100px] transition-colors ${abaAtiva === 'categoria' ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/30' : 'text-gray-500 hover:bg-gray-50'}`}>Categorias</button>
          <button onClick={() => { setAbaAtiva('vendedor'); setMensagem(''); }} className={`flex-1 py-3 font-semibold min-w-[100px] transition-colors ${abaAtiva === 'vendedor' ? 'border-b-2 border-green-600 text-green-600 bg-green-50/30' : 'text-gray-500 hover:bg-gray-50'}`}>Vendedores</button>
          <button onClick={() => { setAbaAtiva('relatorio'); setMensagem(''); }} className={`flex-1 py-3 font-semibold min-w-[100px] transition-colors ${abaAtiva === 'relatorio' ? 'border-b-2 border-purple-600 text-purple-600 bg-purple-50/30' : 'text-gray-500 hover:bg-gray-50'}`}>Relatórios</button>
        </div>

        {abaAtiva === 'produto' && (
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

        {abaAtiva === 'banner' && (
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

        {abaAtiva === 'categoria' && (
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

        {abaAtiva === 'vendedor' && (
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSalvarVendedor} className={`space-y-4 mb-8 p-4 rounded-xl border ${idVendedorEdicao ? 'bg-blue-50/30 border-blue-200' : 'bg-green-50/30 border-green-100'}`}>
              {idVendedorEdicao && <div className="text-blue-600 font-bold text-sm mb-2">Editando Vendedor</div>}
              <div>
                <label className="block text-sm font-medium mb-1">Nome do Vendedor</label>
                <input type="text" required value={nomeVendedor} onChange={(e) => setNomeVendedor(e.target.value)} className="w-full p-2 border rounded-md" placeholder="Ex: João (Matriz)" />
              </div>
              <div className="flex gap-4">
                <div className="w-2/3">
                  <label className="block text-sm font-medium mb-1">Telefone / WhatsApp</label>
                  <input type="text" required value={telefoneVendedor} onChange={(e) => setTelefoneVendedor(e.target.value)} className="w-full p-2 border rounded-md" placeholder="(00) 00000-0000" />
                </div>
                <div className="w-1/3">
                  <label className="block text-sm font-medium mb-1">Comissão (%)</label>
                  <input type="number" step="0.1" required value={comissaoVendedor} onChange={(e) => setComissaoVendedor(e.target.value)} className="w-full p-2 border rounded-md" placeholder="Ex: 5" />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={carregandoVendedor} className={`flex-1 text-white font-bold py-2 rounded-md transition-colors ${idVendedorEdicao ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}>
                  {idVendedorEdicao ? 'Salvar Alterações' : 'Cadastrar Vendedor'}
                </button>
                {idVendedorEdicao && (
                  <button type="button" onClick={cancelarEdicaoVendedor} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-md transition-colors">
                    Cancelar
                  </button>
                )}
              </div>
            </form>

            <h3 className="font-bold border-b pb-2 mb-4">Equipe de Vendas</h3>
            <ul className="space-y-2 text-sm">
              {listaVendedores.map(v => (
                <li key={v.id} className="flex justify-between items-center bg-gray-50 p-3 rounded border border-gray-100">
                  <div>
                    <strong>{v.nome}</strong> <span className="text-gray-500">({v.telefone})</span>
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

        {abaAtiva === 'relatorio' && (
          <div>
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-bold text-xl">Fechamento de Comissões</h3>
              <button 
                onClick={gerarRelatorioPDF} 
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md text-sm flex items-center gap-2 transition-colors shadow-sm"
              >
                📄 Baixar PDF
              </button>
            </div>
            <p className="text-sm text-gray-500 border-b pb-4 mb-6">Relatório em tempo real das vendas realizadas e comissões geradas por cada vendedor.</p>
            
            <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="p-4 font-semibold">Vendedor</th>
                    <th className="p-4 font-semibold text-center">Taxa (%)</th>
                    <th className="p-4 font-semibold text-right">Total Vendido</th>
                    <th className="p-4 font-semibold text-right text-purple-700">Comissão a Pagar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {listaVendedores.map(vend => {
                    const pedidosDesteVendedor = listaPedidos.filter(p => p.vendedor_id === vend.id)
                    const totalVendido = pedidosDesteVendedor.reduce((acc, pedido) => acc + Number(pedido.valor_total), 0)
                    const valorComissao = totalVendido * (vend.comissao_percentual / 100)

                    return (
                      <tr key={vend.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-medium text-gray-900">{vend.nome}</td>
                        <td className="p-4 text-center text-gray-600">{vend.comissao_percentual}%</td>
                        <td className="p-4 text-right text-blue-600 font-bold">R$ {totalVendido.toFixed(2)}</td>
                        <td className="p-4 text-right text-green-600 font-bold bg-green-50/30">
                          R$ {valorComissao.toFixed(2)}
                        </td>
                      </tr>
                    )
                  })}
                  {listaVendedores.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-gray-500 italic">
                        Nenhum vendedor cadastrado no sistema.
                      </td>
                    </tr>
                  )}
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