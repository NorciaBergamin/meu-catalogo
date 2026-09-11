'use client'

import { useState } from 'react'
import { supabase } from '@/utils/supabase'
import { GoogleGenAI } from '@google/genai'

export default function AdminPanel() {
  const [nome, setNome] = useState('')
  const [preco, setPreco] = useState('')
  const [categoria, setCategoria] = useState('Churrasco')
  const [descricao, setDescricao] = useState('')
  const [imagem, setImagem] = useState<File | null>(null)
  const [mensagem, setMensagem] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [gerandoIA, setGerandoIA] = useState(false)

  const gerarDescricaoIA = async () => {
    if (!nome) {
      setMensagem('Digite o nome do produto primeiro para a IA saber o que criar!')
      return
    }
    
    setGerandoIA(true)
    setMensagem('IA escrevendo...')
    
    try {
      // Inicia o Gemini com a sua chave
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY })
      
      // Comando exato que a IA vai receber
      const prompt = `... Foco em atrair o cliente e gerar vendas. Retorne APENAS o texto da descrição, sem frases introdutórias, sem aspas e sem explicações adicionais.`
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
      })
      
      setDescricao(response.text || '')
      setMensagem('Descrição gerada com sucesso!')
    } catch (error) {
      setMensagem('Erro ao gerar descrição com IA.')
      console.error(error)
    }
    setGerandoIA(false)
  }

  const handleSalvarProduto = async (e: React.FormEvent) => {
    e.preventDefault()
    setCarregando(true)
    setMensagem('Salvando...')
    
    const precoNumerico = parseFloat(preco.replace(',', '.'))
    if (isNaN(precoNumerico)) {
      setMensagem('Preço inválido')
      setCarregando(false)
      return
    }

    let imagemUrl = ''
    if (imagem) {
      const fileExt = imagem.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('produtos-imagens').upload(fileName, imagem)
      if (uploadError) {
        setMensagem(`Erro na imagem: ${uploadError.message}`)
        setCarregando(false)
        return
      }
      const { data: publicUrlData } = supabase.storage.from('produtos-imagens').getPublicUrl(fileName)
      imagemUrl = publicUrlData.publicUrl
    }

    const { error } = await supabase
      .from('produtos')
      .insert([{ nome, preco: precoNumerico, imagem_url: imagemUrl, categoria, descricao }])

    if (error) {
      setMensagem(`Erro ao salvar: ${error.message}`)
    } else {
      setMensagem('Produto salvo com sucesso!')
      setNome('')
      setPreco('')
      setDescricao('')
      setImagem(null)
    }
    setCarregando(false)
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50 text-gray-900">
      <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold mb-6">Cadastrar Produto</h1>
        <form onSubmit={handleSalvarProduto} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome do Produto</label>
            <input type="text" required value={nome} onChange={(e) => setNome(e.target.value)} className="w-full p-2 border rounded-md" />
          </div>
          
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium mb-1">Preço (R$)</label>
              <input type="text" required value={preco} onChange={(e) => setPreco(e.target.value)} className="w-full p-2 border rounded-md" placeholder="Ex: 99,90" />
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-medium mb-1">Categoria</label>
              <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="w-full p-2 border rounded-md bg-white">
                <option value="Churrasco">Churrasco</option>
                <option value="Instrumentos">Instrumentos Musicais</option>
                <option value="Aquarismo">Aquarismo</option>
                <option value="Outros">Outros</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-end mb-1">
              <label className="block text-sm font-medium">Descrição</label>
              <button 
                type="button" 
                onClick={gerarDescricaoIA}
                disabled={gerandoIA || !nome}
                className="text-xs bg-purple-100 text-purple-700 font-bold px-2 py-1 rounded hover:bg-purple-200 disabled:opacity-50 transition"
              >
                {gerandoIA ? 'Gerando...' : '✨ Gerar com IA'}
              </button>
            </div>
            <textarea 
              rows={3} 
              value={descricao} 
              onChange={(e) => setDescricao(e.target.value)} 
              className="w-full p-2 border rounded-md text-sm"
              placeholder="Descreva o produto ou use o botão acima para gerar automaticamente."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Foto do Produto</label>
            <input type="file" accept="image/*" onChange={(e) => setImagem(e.target.files?.[0] || null)} className="w-full p-2 border rounded-md bg-white" />
          </div>
          <button type="submit" disabled={carregando} className="w-full bg-blue-600 text-white font-bold py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">
            {carregando ? 'Salvando...' : 'Salvar Produto'}
          </button>
        </form>
        {mensagem && <p className="mt-4 text-center font-medium text-green-600">{mensagem}</p>}
      </div>
    </main>
  )
}