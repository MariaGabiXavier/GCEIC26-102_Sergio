const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());


// checa se api no ar
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() , by:'SLMM33', turma:'101'});
});

app.get('/api/tabelas', (req, res) => {
  const { TABELA, calcular } = require('./funcoes');
  res.json({
	success: true,
	data: {
		base: TABELA.BASE_CALC.faixas,
		referencia: `${TABELA.REFERENCIA * 100}%`,
	},
  });

});

// POST /api/calcular
app.post('/api/calcular', (req, res) => {
  try {
	const { TABELA, calcular } = require('./funcoes');
    const dados = req.body;
	console.log(dados);

    if (!dados || typeof dados !== 'object') {
      return res.status(400).json({ error: 'Corpo da requisição inválido' });
    }
    
    const resultado = calcular(dados);
	console.log(resultado);
    return res.status(200).json({ success: true, data: resultado });
  } catch (err) {
	console.log(err.message);
    return res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = app


