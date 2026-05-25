const {
  buildDriver,
  By,
  until,
  click,
  type,
  screenshot,
  openHelpAndValidate
} = require("./helpers");

const BASE_URL =
  process.env.API_URL || "http://localhost:3001";

const APP_BASE = BASE_URL + "/financecar";

let driver;
const erros = [];

// ======================================
// MOCK API
// ======================================
function startMockApi() {

  const http = require("http");

  return new Promise((resolve) => {

    const server = http.createServer((req, res) => {

      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");

      if (req.method === "OPTIONS") {
        res.writeHead(204);
        return res.end();
      }

      if (req.url === "/api/financiamento/juros") {
        return res.end(JSON.stringify({ resultado: 10 }));
      }

      if (req.url === "/api/financiamento/financiamento") {
        return res.end(JSON.stringify({ resultado: 1000 }));
      }

      if (req.url === "/api/financiamento/fundo") {
        return res.end(JSON.stringify({ resultado: 500 }));
      }

      if (req.url === "/api/financiamento/regra") {
        return res.end(JSON.stringify({ necessidade: 50 }));
      }

      res.writeHead(404);
      res.end("Not found");

    });

    server.listen(4000, "127.0.0.1", () => {
      console.log("✅ Mock API rodando na porta 4000");
      resolve(server);
    });

  });

}

// ======================================
// AUTENTICAÇÃO
// ======================================
async function autenticar() {

  await driver.get(APP_BASE + "/login");

  await driver.wait(
    until.elementLocated(By.css('input[type="text"]')),
    5000
  );

  await type(driver, 'input[type="text"]', "adm");
  await type(driver, 'input[type="password"]', "adm");

  await click(driver, 'button[type="submit"]');

  await driver.wait(
    until.urlContains("/financecar/home"),
    5000
  );

}

// ======================================
// TESTE SPLASH
// ======================================
async function testeSplash() {

  console.log("\n[1/6] Splash");

  await driver.get(APP_BASE);

  await driver.wait(
    until.elementLocated(By.css(".logo-splash")),
    10000
  );

  const logo = await driver.findElement(By.css(".logo-splash"));

  if (!logo) {
    erros.push("Logo splash não encontrada");
  }

  await screenshot(driver, "01-splash");

}

// ======================================
// TESTE LOGIN
// ======================================
async function testeLogin() {

  console.log("\n[2/6] Login");

  // inválido
  await driver.get(APP_BASE + "/login");

  await driver.wait(
    until.elementLocated(By.css('input[type="text"]')),
    5000
  );

  await type(driver, 'input[type="text"]', "errado");
  await type(driver, 'input[type="password"]', "errado");

  await click(driver, 'button[type="submit"]');

  await driver.wait(
    until.elementLocated(By.css(".error")),
    5000
  );

  await screenshot(driver, "02-login-erro");

  // válido
  await driver.get(APP_BASE + "/login");

  await type(driver, 'input[type="text"]', "adm");
  await type(driver, 'input[type="password"]', "adm");

  await click(driver, 'button[type="submit"]');

  await driver.wait(
    until.urlContains("/financecar/home"),
    5000
  );

  await screenshot(driver, "02-login-sucesso");

}

// ======================================
// TESTE ROTAS
// ======================================
async function testeRotas() {

  console.log("\n[3/6] Rotas protegidas");

  const rotas = [
    "/financecar/home",
    "/financecar/juros",
    "/financecar/financiamento",
    "/financecar/fundo",
    "/financecar/regra",
    "/financecar/sobre"
  ];

  for (const rota of rotas) {

    await driver.get(APP_BASE + "/login");

    await driver.executeScript(`
      localStorage.clear();
      sessionStorage.clear();
    `);

    await driver.manage().deleteAllCookies();

    await driver.get(BASE_URL + rota);

    await driver.wait(
      until.urlContains("/financecar/login"),
      5000
    );

    const urlFinal = await driver.getCurrentUrl();

    if (!urlFinal.includes("/financecar/login")) {
      erros.push(`Rota não protegida: ${rota}`);
    }

  }

}

// ======================================
// TESTE TELAS
// ======================================
async function testeTelas() {

  console.log("\n[4/6] Telas");

  await autenticar();

  const telas = [
    "/financecar/juros",
    "/financecar/financiamento",
    "/financecar/fundo",
    "/financecar/regra"
  ];

  for (const t of telas) {

    await driver.get(BASE_URL + t);

    await driver.wait(
      until.elementLocated(By.css(".card")),
      5000
    );

    await screenshot(driver, `04-${t.replace("/financecar/", "")}`);

  }

}

// ======================================
// TESTE SOBRE
// ======================================
async function testeSobre() {

  console.log("\n[5/6] Sobre");

  await autenticar();

  await driver.get(APP_BASE + "/sobre");

  await driver.wait(
    until.elementLocated(By.css(".card")),
    5000
  );

  const cards = await driver.findElements(By.css(".card"));

  if (cards.length === 0) {
    erros.push("Sem membros");
  }

  await screenshot(driver, "05-sobre");

}

// ======================================
// TESTE HELP
// ======================================
async function testeHelpGeral() {

  console.log("\n[6/6] Help");

  await autenticar();

  const telas = [
    "juros",
    "financiamento",
    "fundo",
    "regra"
  ];

  for (const t of telas) {

    await driver.get(APP_BASE + "/" + t);

    await driver.wait(
      until.elementLocated(By.css(".card")),
      5000
    );

    await openHelpAndValidate(driver, t);

  }

}

// ======================================
// MAIN
// ======================================
async function main() {

  const api = await startMockApi();

  // 🔥 FIX PRINCIPAL
  driver = await buildDriver();

  await driver.manage().window().setRect({
            width: 1400,
            height: 900
        });

  try {

    await testeSplash();
    await testeLogin();
    await testeRotas();
    await testeTelas();
    await testeSobre();
    await testeHelpGeral();

  } catch (err) {

    console.error("❌ Erro fatal:", err);
    process.exit(1);

  } finally {

    if (driver) await driver.quit();
    api.close();
  }

  console.log("\n────────────────────────────");

  if (erros.length === 0) {
    console.log("✅ Tudo passou!");
  } else {
    console.log(`❌ ${erros.length} falhas`);
    erros.forEach(e => console.log(" • " + e));
    process.exit(1);
  }
}

module.exports = main;

if (require.main === module) {
  main();
}