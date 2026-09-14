import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { nome, categoria } = await request.json();

    // Pega a chave do ambiente do servidor (pode ser NEXT_PUBLIC ou GEMINI_API_KEY)
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Chave da API do Gemini não configurada no servidor.' }, { status: 500 });
    }

    const prompt = `Atue como um especialista em marketing. Crie uma descrição comercial curta e altamente persuasiva (máximo de 3 frases) para um produto de e-commerce. O produto é: ${nome}. Categoria: ${categoria}. Foco em atrair o cliente e gerar vendas. Retorne APENAS o texto da descrição direto ao ponto, sem aspas.`;

    // Requisição segura feita direto pelo backend do Next.js
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 400 });
    }

    const textoGerado = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return NextResponse.json({ descricao: textoGerado.trim() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro interno ao gerar descrição.' }, { status: 500 });
  }
}