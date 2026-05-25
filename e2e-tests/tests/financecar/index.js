const splash = require("./splash.test.js");
const login = require("./login.test.js");
const rotas = require("./protected-redirect.test.js");
const home = require("./dashboard.test.js");

const juros = require("./juros.test.js");
const financiamento = require("./financiamento.test.js");
const fundo = require("./fundo.test.js");
const regra = require("./regra.test.js");

const sobre = require("./about.test.js");

async function runFinanceTests() {

  console.log("\n--- Iniciando testes do FinanceCar ---");

  const suites = [
    ["splash", splash],
    ["login", login],
    ["rotas protegidas", rotas],
    ["home", home],
    ["juros compostos", juros],
    ["financiamento", financiamento],
    ["fundo emergência", fundo],
    ["regra 50/30/20", regra],
    ["sobre", sobre],
  ];

  for (const [name, testFn] of suites) {
    console.log(`\n[FINANCECAR] ${name}`);

    try {
      await testFn(); // 
      console.log(`[OK] ${name}`);
    } catch (err) {
      console.error(`[FAIL] ${name}`, err);
      break; // opcional: para no primeiro erro
    }
  }

  console.log("\n--- FINANCECAR FINALIZADO ---");
}

module.exports = runFinanceTests;