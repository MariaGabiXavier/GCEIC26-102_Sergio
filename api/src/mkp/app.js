const express = require('express');
const {
  calcularMarkup,
  calcularCustos,
  calcularPrecoVenda
} = require('./mkpFuncoes');

const router = express.Router();

router.post('/markup', (req, res) => {
  try {
    return res.json(calcularMarkup(req.body));
  } catch (err) {
    return res.status(400).json({
      error: err.message
    });
  }
});

router.post('/custos', (req, res) => {
  try {
    return res.json(calcularCustos(req.body));
  } catch (err) {
    return res.status(400).json({
      erro: err.message
    });
  }
});

router.post('/preco-venda', (req, res) => {
  try {
    return res.json(calcularPrecoVenda(req.body));
  } catch (err) {
    return res.status(400).json({
      erro: err.message
    });
  }
});

module.exports = router;
