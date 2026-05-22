const dashboard = require("./dashboard.test.js");
const dy = require("./calculator-dy.test.js");
const payout = require("./calculator-payout.test.js");
const drip = require("./calculator-drip.test.js");
const about = require("./about.test.js");
const help = require("./help.test.js");

async function runCddTests(ctx) {
  console.log("\n--- Iniciando testes do CDD ---");
  const suites = [
    ["dashboard", dashboard],
    ["calculator-dy", dy],
    ["calculator-payout", payout],
    ["calculator-drip", drip],
    ["about", about],
    ["help", help],
  ];
  for (const [name, fn] of suites) {
    console.log(`\n[CDD] ${name}`);
    await fn(ctx);
  }
  console.log("\n--- CDD OK ---");
}

module.exports = runCddTests;
