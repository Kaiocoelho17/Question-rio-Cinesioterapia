const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'db.json');

// Cria o arquivo de banco de dados se não existir
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ respostas: [] }, null, 2));
  console.log('📦 Banco de dados criado:', DB_FILE);
}

function lerDB() {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao ler banco:', error);
    return { respostas: [] };
  }
}

function salvarDB(dados) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dados, null, 2));
  } catch (error) {
    console.error('Erro ao salvar banco:', error);
  }
}

module.exports = {
  salvarResposta: (dados) => {
    const db = lerDB();
    
    const novaResposta = {
      id: Date.now(),
      nome: dados.nome || 'Anônimo',
      idade: dados.idade ? parseInt(dados.idade) : null,
      tempo: dados.tempo || null,
      data_resposta: new Date().toISOString(),
      q1_aquecimento: dados.q1 || null,
      q2_lesao_anterior: dados.q2 || null,
      q3_orientacao_profissional: dados.q3 || null,
      q4_estalos_travamentos: dados.q4 || null,
      q5_cuidado_importante: dados.q5 || null,
      q6_fator_legpress: dados.q6 || null,
      q7_orientacao_fisio: dados.q7 || null
    };
    
    db.respostas.push(novaResposta);
    salvarDB(db);
    
    console.log('✅ Resposta salva:', novaResposta.id);
    return { id: novaResposta.id };
  },
  
  listarRespostas: () => {
    const db = lerDB();
    return db.respostas.sort((a, b) => b.id - a.id);
  },
  
  getEstatisticas: () => {
    const db = lerDB();
    const r = db.respostas;
    const total = r.length;
    
    // Calcular idade média
    const idades = r.filter(x => x.idade).map(x => parseInt(x.idade));
    const mediaIdade = idades.length > 0 
      ? (idades.reduce((a, b) => a + b, 0) / idades.length).toFixed(1)
      : '0';
    
    // Tempo mais comum
    const tempos = r.filter(x => x.tempo).map(x => x.tempo);
    const tempoMaisComum = tempos.length > 0 
      ? tempos.reduce((a, b, _, arr) => 
          arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b)
      : '—';
    
    // Porcentagens
    const pct = (count) => total > 0 ? Math.round((count / total) * 100) : 0;
    
    // Cuidado mais votado (Q5)
    const votosQ5 = {};
    r.forEach(x => { if (x.q5_cuidado_importante) votosQ5[x.q5_cuidado_importante] = (votosQ5[x.q5_cuidado_importante] || 0) + 1; });
    const cuidadoMaisVotado = Object.entries(votosQ5).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
    
    // Fator Leg Press mais votado (Q6)
    const votosQ6 = {};
    r.forEach(x => { if (x.q6_fator_legpress) votosQ6[x.q6_fator_legpress] = (votosQ6[x.q6_fator_legpress] || 0) + 1; });
    const fatorLegPressMaisVotado = Object.entries(votosQ6).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
    
    return {
      total,
      mediaIdade: mediaIdade + ' anos',
      tempoMaisComum,
      aquecimento_sempre_pct: pct(r.filter(x => x.q1_aquecimento === 'Sempre').length),
      lesao_sim_pct: pct(r.filter(x => x.q2_lesao_anterior === 'Sim').length),
      orientacao_sim_pct: pct(r.filter(x => x.q3_orientacao_profissional === 'Sim').length),
      estalos_sim_pct: pct(r.filter(x => x.q4_estalos_travamentos === 'Sim').length),
      fisio_sim_pct: pct(r.filter(x => x.q7_orientacao_fisio === 'Sim').length),
      cuidadoMaisVotado,
      fatorLegPressMaisVotado
    };
  }
};