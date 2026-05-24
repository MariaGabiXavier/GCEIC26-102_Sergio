// ============================================================
// Time_2 (ETEC) — Rotas /ETEC1
// ============================================================

const express = require('express');
const router  = express.Router();
const {
  calcularSalarioMensal,
  calcularFerias,
  calcularRescisao,
  calcularDecimoTerceiro,
} = require('./etec1.function');

// GET /ETEC1/ — health check da equipe
router.get('/', (req, res) => {
  res.json({ equipe: 'Time_2', tema: 'Encargos Trabalhistas - Empregada Doméstica', rotas: ['/salario', '/ferias', '/rescisao', '/decimoterceiro'] });
});

// POST /ETEC1/salario
// body: { salario: number }
router.post('/salario', (req, res) => {
  const { salario } = req.body;
  if (!salario || isNaN(salario) || salario <= 0)
    return res.status(400).json({ erro: 'Informe um salário válido (número positivo).' });
  res.json(calcularSalarioMensal(parseFloat(salario)));
});

// POST /ETEC1/ferias
// body: { salario: number }
router.post('/ferias', (req, res) => {
  const { salario } = req.body;
  if (!salario || isNaN(salario) || salario <= 0)
    return res.status(400).json({ erro: 'Informe um salário válido.' });
  res.json(calcularFerias(parseFloat(salario)));
});

// POST /ETEC1/rescisao
// body: { salario: number, mesesTrabalhados: number, motivoDemissao: string }
router.post('/rescisao', (req, res) => {
  const { salario, mesesTrabalhados, motivoDemissao } = req.body;
  const motivos = ['sem_justa_causa', 'justa_causa', 'pedido_demissao'];
  if (!salario || isNaN(salario) || salario <= 0)
    return res.status(400).json({ erro: 'Informe um salário válido.' });
  if (!mesesTrabalhados || isNaN(mesesTrabalhados) || mesesTrabalhados <= 0)
    return res.status(400).json({ erro: 'Informe os meses trabalhados.' });
  if (!motivos.includes(motivoDemissao))
    return res.status(400).json({ erro: `motivoDemissao deve ser: ${motivos.join(' | ')}` });

  res.json(calcularRescisao(parseFloat(salario), parseInt(mesesTrabalhados), motivoDemissao));
});

// POST /ETEC1/decimoterceiro
// body: { salario: number, mesesTrabalhados: number }
router.post('/decimoterceiro', (req, res) => {
  const { salario, mesesTrabalhados } = req.body;
  if (!salario || isNaN(salario) || salario <= 0)
    return res.status(400).json({ erro: 'Informe um salário válido.' });
  if (!mesesTrabalhados || isNaN(mesesTrabalhados) || mesesTrabalhados <= 0)
    return res.status(400).json({ erro: 'Informe os meses trabalhados (1–12).' });

  res.json(calcularDecimoTerceiro(parseFloat(salario), parseInt(mesesTrabalhados)));
});

module.exports = router;
