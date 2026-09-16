import { Metadata } from 'next'
import { supabase } from '@/utils/supabase'
import ProdutoClient from './ProdutoClient'

type Props = {
  params: { id: string } | Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params)
  const id = resolvedParams.id

  const { data: produto } = await supabase.from('produtos').select('*').eq('id', id).single()

  if (!produto) {
    return {
      title: 'PROACADE - Produto não encontrado',
      description: 'Catálogo de artigos religiosos',
    }
  }

  const imageUrl = produto.imagem_url || ''
  const precoFormatado = `R$ ${Number(produto.preco).toFixed(2)}`

  return {
    title: `${produto.nome} - PROACADE`,
    description: produto.descricao ? produto.descricao.substring(0, 160) : `Compre ${produto.nome} por ${precoFormatado} na PROACADE.`,
    openGraph: {
      title: `${produto.nome} | PROACADE`,
      description: `Por apenas ${precoFormatado}. Confira no catálogo!`,
      images: imageUrl ? [{ url: imageUrl, width: 800, height: 800, alt: produto.nome }] : [],
      type: 'website',
    },
  }
}

export default async function Page({ params }: Props) {
  const resolvedParams = await Promise.resolve(params)
  return <ProdutoClient id={resolvedParams.id} />
}