const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());


// checa se api no ar
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString()});
});


// POST /api/calcularPrecoVenda
app.post('/api/calcularPrecoVenda', (req, res) => {
  try {
    const { calcularPrecoVenda } = require('./funcoes');
    const dados = req.body;
  console.log('Api: calcularPrecoVenda');
	console.log(dados);

    if (!dados || typeof dados !== 'object') {
      return res.status(400).json({ error: 'Corpo da requisição inválido' });
    }
    
    const resultado = calcularPrecoVenda(dados);
	console.log(resultado);
    return res.status(200).json({ success: true, data: resultado });
  } catch (err) {
	console.log(err.message);
    return res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/calcularMarkupMultiplicador
app.post('/api/calcularMarkupMultiplicador', (req, res) => {
  try {
    const { calcularMKM } = require('./funcoes');
    const dados = req.body;
    console.log('Api: calcularMarkupMultiplicador');
    console.log(dados);
    if (!dados || typeof dados !== 'object') {
      return res.status(400).json({ error: 'Corpo da requisição inválido' });
    }
    const { dv = 0, df = 0, ml = 0 } = dados;
    const resultado = calcularMKM(dv, df, ml);
    console.log(resultado);
    return res.status(200).json({ success: true, data: resultado });
  } catch (err) {
    console.log(err.message);
    return res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/calcularDesconto
app.post('/api/calcularDesconto', (req, res) => {
  try {
    const { calcularDesconto } = require('./funcoes');
    const dados = req.body;
    console.log('Api: calcularDesconto');
  console.log(dados);
    if (!dados || typeof dados !== 'object') {
      return res.status(400).json({ error: 'Corpo da requisição inválido' });
    }
    const resultado = calcularDesconto(dados);
  console.log(resultado);
    return res.status(200).json({ success: true, data: resultado });
  } catch (err) {
  console.log(err.message);
    return res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = app



