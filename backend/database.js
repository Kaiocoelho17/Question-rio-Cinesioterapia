const mongoose = require('mongoose');

// Conecta ao MongoDB
const MONGO_URL = process.env.MONGO_URL;

mongoose.connect(MONGO_URL)
  .then(() => console.log('✅ MongoDB conectado!'))
  .catch(err => console.error('❌ Erro ao conectar MongoDB:', err));

// Define o modelo da resposta
const RespostaSchema = new mongoose.Schema({
  id: { type: Number, default: () => Date.now() },
  nome: { type: String, default: 'Anônimo' },
  idade: { type: Number, default: null },
  tempo: { type: String, default: null },
  data_resposta: { type: String, default: () => new Date().toISOString() },
  q1_aquecimento: { type: String, default: null },
  q2_lesao_anterior: { type: String, default: null },
  q3_orientacao_profissional: { type: String, default: null },
  q4_estalos_travamentos: { type: String, default: null },
  q5_cuidado_importante: { type: String, default: null },
  q6_fator_legpress: { type: String, default: null },
  q7_orientacao_fisio: { type: String, default: null }
});

const Resposta = mongoose.model('Resposta', RespostaSchema);

module.exports = {
  salvarResposta: async (dados) => {
    const novaResposta = new Resposta({
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
    });

    await novaResposta.save();
    console.log('✅ Resposta salva:', novaResposta.id);
    return { id: novaResposta.id };
  },

  listarRespostas: async () => {
    const respostas = await Resposta.find().sort({ id: -1 });
    return respostas;
  },

  getEstatisticas: async () => {
    const r = await Resposta.find();
    const total = r.length;

    const idades = r.filter(x => x.idade).map(x => parseInt(x.idade));
    const mediaIdade = idades.length > 0
      ? (idades.reduce((a, b) => a + b, 0) / idades.length).toFixed(1)
      : '0';

    const tempos = r.filter(x => x.tempo).map(x => x.tempo);
    const tempoMaisComum = tempos.length > 0
      ? tempos.reduce((a, b, _, arr) =>
          arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b)
      : '—';

    const pct = (count) => total > 0 ? Math.round((count / total) * 100) : 0;

    const votosQ5 = {};
    r.forEach(x => { if (x.q5_cuidado_importante) votosQ5[x.q5_cuidado_importante] = (votosQ5[x.q5_cuidado_importante] || 0) + 1; });
    const cuidadoMaisVotado = Object.entries(votosQ5).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

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