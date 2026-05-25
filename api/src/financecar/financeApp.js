const express = require("express");
const router = express.Router();

const {
  calcularJurosCompostos,
  calcularFinanciamentoVeiculo,
  calcularFundoEmergencia,
  calcularRegra503020
} = require("./financeFuncoes");

// LOGIN
const VALID_USER = "adm";
const VALID_PASS = "adm";
const STATIC_TOKEN = "token-simulado-123";

router.post("/login", (req, res) => {
  const { user, password } = req.body;

  if (user === VALID_USER && password === VALID_PASS) {
    return res.json({ token: STATIC_TOKEN });
  }

  return res.status(401).json({ erro: "Usuário ou senha inválidos" });
});

router.post("/auth", (req, res) => {
  const { token } = req.body;

  if (token === STATIC_TOKEN) {
    return res.json({ token });
  }

  return res.status(401).json({ erro: "Token inválido" });
});


// =======================
// JUROS COMPOSTOS
// =======================
router.post("/juros", (req, res) => {
  try {
    const {
      valorInicial,
      aporteMensal,
      taxaJuros,
      tempo
    } = req.body;

    const resultado = calcularJurosCompostos(
      valorInicial,
      aporteMensal,
      taxaJuros,
      tempo
    );

    return res.json(resultado);

  } catch (e) {
    return res.status(400).json({ erro: e.message });
  }
});


// =======================
// FINANCIAMENTO VEÍCULO
// =======================
router.post("/financiamento", (req, res) => {
  try {
    const {
      valorVeiculo,
      entrada,
      taxaJuros,
      parcelas
    } = req.body;

    const resultado = calcularFinanciamentoVeiculo(
      valorVeiculo,
      entrada,
      taxaJuros,
      parcelas
    );

    return res.json(resultado);

  } catch (e) {
    return res.status(400).json({ erro: e.message });
  }
});


// =======================
// FUNDO DE EMERGÊNCIA
// =======================
router.post("/fundo", (req, res) => {
  try {

    const {
      gastosFixosMensais,
      gastosVariaveis,
      mesesSeguranca
    } = req.body;

    const resultado = calcularFundoEmergencia(
      gastosFixosMensais,
      gastosVariaveis,
      mesesSeguranca
    );

    return res.json(resultado);

  } catch (e) {
    return res.status(400).json({
      erro: e.message
    });
  }
});


// =======================
// REGRA 50/30/20
// =======================
router.post("/regra", (req, res) => {
  try {
    const { salarioLiquido } = req.body;

    const resultado = calcularRegra503020(salarioLiquido);

    return res.json(resultado);

  } catch (e) {
    return res.status(400).json({ erro: e.message });
  }
});

module.exports = router;