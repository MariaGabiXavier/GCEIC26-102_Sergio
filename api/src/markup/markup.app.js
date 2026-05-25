// ============================================================
// Markup — Rotas /markup
// ============================================================

const express = require('express');
const router  = express.Router();
const {
  calcularPrecoVenda,
  calcularMKM,
  calcularDesconto,
} = require('./markup.funcoes');

// GET / — health check
router.get('/', (req, res) => {
  res.json({ equipe: 'Markup', tema: 'Cálculos de Markup', rotas: ['/calcularPrecoVenda', '/calcularMarkupMultiplicador', '/calcularDesconto'] });
});

// POST /calcularPrecoVenda
router.post('/calcularPrecoVenda', (req, res) => {
  const dados = req.body;
  if (!dados || typeof dados !== 'object')
    return res.status(400).json({ success: false, error: 'Corpo da requisição inválido' });
  try {
    res.json({ success: true, data: calcularPrecoVenda(dados) });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /calcularMarkupMultiplicador
router.post('/calcularMarkupMultiplicador', (req, res) => {
  const { dv = 0, df = 0, ml = 0 } = req.body;
  if (dv <= 0 || df <= 0 || ml <= 0)
    return res.status(400).json({ success: false, error: 'Informe valores positivos para dv, df e ml.' });
  try {
    res.json({ success: true, data: calcularMKM(dv, df, ml) });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /calcularDesconto
router.post('/calcularDesconto', (req, res) => {
  const { preco = 0, desconto = 0 } = req.body;
  if (preco <= 0 || desconto < 0 || desconto > 100)
    return res.status(400).json({ success: false, error: 'Informe preço positivo e desconto entre 0 e 100.' });
  try {
    res.json({ success: true, data: calcularDesconto({ preco, desconto }) });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;