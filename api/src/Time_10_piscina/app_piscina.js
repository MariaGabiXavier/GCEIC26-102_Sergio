const express = require('express');
const router  = express.Router(); 

const {
  TABELA,
  calcularVolume,
  calcularCustoAgua,
  calcularCustoEletrico,
  calcularCustoHidraulico,
  calcularManutencaoMensal,
  calcularCustoTotal,
} = require('./funcoes_piscina');

// GET /api/Time_10_piscina/tabelas
router.get('/tabelas', (req, res) => {
  res.json({ success: true, data: TABELA });
});

// POST /api/Time_10_piscina/volume
router.post('/volume', (req, res) => {
  try {
    const { comprimento, largura, profundidade } = req.body;
    if (!comprimento || !largura || !profundidade) {
      return res.status(400).json({ success: false, error: 'Informe comprimento, largura e profundidade' });
    }
    const volume = calcularVolume(comprimento, largura, profundidade);
    return res.status(200).json({ success: true, data: { volume_m3: volume } });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/Time_10_piscina/custo-agua
router.post('/custo-agua', (req, res) => {
  try {
    const { volume } = req.body;
    if (!volume) return res.status(400).json({ success: false, error: 'Informe o volume' });
    const custo = calcularCustoAgua(volume);
    return res.status(200).json({ success: true, data: { custo_agua: custo } });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/Time_10_piscina/custo-eletrico
router.post('/custo-eletrico', (req, res) => {
  try {
    const { temIluminacao = true } = req.body;
    const custo = calcularCustoEletrico(temIluminacao);
    return res.status(200).json({ success: true, data: { custo_eletrico: custo } });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/Time_10_piscina/custo-hidraulico
router.post('/custo-hidraulico', (req, res) => {
  try {
    const { volume } = req.body;
    if (!volume) return res.status(400).json({ success: false, error: 'Informe o volume' });
    const custo = calcularCustoHidraulico(volume);
    return res.status(200).json({ success: true, data: { custo_hidraulico: custo } });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

// GET /api/Time_10_piscina/manutencao-mensal
router.get('/manutencao-mensal', (req, res) => {
  const custo = calcularManutencaoMensal();
  return res.status(200).json({ success: true, data: { manutencao_mensal: custo } });
});

// POST /api/Time_10_piscina/calcular-total
router.post('/calcular-total', (req, res) => {
  try {
    const dados = req.body;
    if (!dados || typeof dados !== 'object') {
      return res.status(400).json({ success: false, error: 'Corpo da requisição inválido' });
    }
    const resultado = calcularCustoTotal(dados);
    return res.status(200).json({ success: true, data: resultado });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;