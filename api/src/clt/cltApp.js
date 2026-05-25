const express = require('express');
const {
  calcularSalarioLiquido,
  calcularCustoEmpresa,
  calcularResultadoContratacao,
  listarTabelas,
} = require('./cltFuncoes');

const router = express.Router();
const VALID_USER = 'adm';
const VALID_PASS = 'adm';
const STATIC_TOKEN = 'token-clt-empresarial-123';

function validarToken(req, res, next) {
  const { token } = req.body || {};
  if (token === STATIC_TOKEN) return next();
  return res.status(401).json({ erro: 'Token invalido' });
}

function responderCalculo(res, callback) {
  try {
    return res.json({ success: true, data: callback() });
  } catch (err) {
    return res.status(400).json({ success: false, erro: err.message });
  }
}

router.post('/login', (req, res) => {
  const { user, password } = req.body || {};
  if (user === VALID_USER && password === VALID_PASS) return res.json({ token: STATIC_TOKEN });
  return res.status(401).json({ erro: 'Usuario ou senha invalidos' });
});

router.post('/auth', (req, res) => {
  const { token } = req.body || {};
  if (token === STATIC_TOKEN) return res.json({ token });
  return res.status(401).json({ erro: 'Token invalido' });
});

router.get('/tabelas', (_req, res) => {
  res.json({ success: true, data: listarTabelas() });
});

router.post('/salario-liquido', validarToken, (req, res) => {
  responderCalculo(res, () => calcularSalarioLiquido(req.body));
});

router.post('/custo-empresa', validarToken, (req, res) => {
  responderCalculo(res, () => calcularCustoEmpresa(req.body));
});

router.post('/resultado-contratacao', validarToken, (req, res) => {
  responderCalculo(res, () => calcularResultadoContratacao(req.body));
});

module.exports = router;
