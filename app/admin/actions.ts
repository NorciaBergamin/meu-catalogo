'use server'

export async function gerarDescricaoAcao(nome: string, categoria: string) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('Chave da API da Groq não configurada.');
    }

    const prompt = `Atue como um especialista em marketing. Crie uma descrição comercial curta e altamente persuasiva (máximo de 3 frases) para um produto de e-commerce. O produto é: ${nome}. Categoria: ${categoria}. Foco em atrair o cliente e gerar vendas. Retorne APENAS o texto da descrição direto ao ponto, sem aspas.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    const textoGerado = data.choices?.[0]?.message?.content || '';
    return { descricao: textoGerado.trim() };
  } catch (error: any) {
    throw new Error(error.message || 'Erro interno ao gerar descrição.');
  }
}