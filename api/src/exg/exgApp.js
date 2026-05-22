const express = require('express');
const { getCurrency, getAvailableCurrencies, isValidType, calcularConversao } = require('./exgFuncoes');

const router = express.Router();
const VALID_USER  = 'adm';
const VALID_PASS  = 'adm';
const STATIC_TOKEN = 'token-simulado-123';

router.post('/login', (req, res) => {
  const { user, password } = req.body;
  if (!user || !password)
    return res.status(401).json({ erro: 'Usuário ou senha invalidos' });
  if (user === VALID_USER && password === VALID_PASS)
    return res.json({ token: STATIC_TOKEN });
  res.status(401).json({ erro: 'Usuário ou senha invalidos' });
});

router.post('/auth', (req, res) => {
  const { token } = req.body;
  if (token === STATIC_TOKEN) return res.json({ token });
  res.status(401).json({ erro: 'Token inválido' });
});

router.get('/listCurrency', (_req, res) => {
  res.json(getAvailableCurrencies());
});

router.post('/exchange', (req, res) => {
  const { currencyCode, value, type, token } = req.body;

  if (token !== STATIC_TOKEN)
    return res.status(401).json({ erro: 'Token inválido' });
  if (!currencyCode || value === undefined || !type)
    return res.status(400).json({ erro: 'Informe "currencyCode", "value" e "type" (turism | comercial)' });
  if (typeof value !== 'number' || value <= 0)
    return res.status(400).json({ erro: '"value" deve ser um número positivo' });

  const tipoNorm = String(type).toLowerCase();
  if (!isValidType(tipoNorm))
    return res.status(400).json({ erro: '"type" deve ser "turism" ou "comercial"' });

  const moeda = getCurrency(currencyCode);
  if (!moeda)
    return res.status(404).json({ erro: `Moeda "${currencyCode}" não encontrada` });

  try {
    res.json(calcularConversao(value, currencyCode, tipoNorm));
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
});

module.exports = router;
