const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.get('/api/health', (req, res) => {
  res.json({ 
    ok: true, 
    mensagem: 'Servidor online!', 
    timestamp: new Date().toISOString() 
  });
});

app.post('/api/respostas', async (req, res) => {
  try {
    console.log('📥 Recebendo dados:', req.body);
    
    const { nome, idade, tempo, respostas } = req.body;
    
    if (!nome || !respostas) {
      return res.status(400).json({ 
        error: 'Nome e respostas são obrigatórios',
        recebido: req.body
      });
    }
    
    const result = await db.salvarResposta({
      nome,
      idade,
      tempo,
      q1: respostas[1],
      q2: respostas[2],
      q3: respostas[3],
      q4: respostas[4],
      q5: respostas[5],
      q6: respostas[6],
      q7: respostas[7]
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Resposta salva com sucesso!', 
      id: result.id 
    });
    
  } catch (error) {
    console.error('❌ Erro ao salvar:', error);
    res.status(500).json({ 
      error: 'Erro interno ao salvar resposta',
      detalhe: error.message 
    });
  }
});

app.get('/api/respostas', async (req, res) => {
  try {
    const dados = await db.listarRespostas();
    res.json({ 
      success: true, 
      total: dados.length,
      data: dados 
    });
  } catch (error) {
    console.error('❌ Erro ao buscar:', error);
    res.status(500).json({ error: 'Erro ao buscar respostas' });
  }
});

app.get('/api/estatisticas', async (req, res) => {
  try {
    const stats = await db.getEstatisticas();
    res.json({ 
      success: true, 
      stats 
    });
  } catch (error) {
    console.error('❌ Erro nas estatísticas:', error);
    res.status(500).json({ error: 'Erro ao gerar estatísticas' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ====================================');
  console.log('🏋️  SERVIDOR RODANDO!');
  console.log('🚀 ====================================');
  console.log('📡 Porta:', PORT);
  console.log('🌐 URL: http://localhost:' + PORT);
  console.log('🔗 Health: http://localhost:' + PORT + '/api/health');
  console.log('📊 Stats: http://localhost:' + PORT + '/api/estatisticas');
  console.log('✅ Pressione Ctrl+C para parar');
  console.log('🚀 ====================================');
  console.log('');
});

// Tratamento de erros
process.on('uncaughtException', (error) => {
  console.error('❌ Erro não tratado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Rejeição não tratada:', reason);
});