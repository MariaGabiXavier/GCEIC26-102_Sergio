const { Builder, By } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const fs = require("fs");
const path = require("path");
const runPiscinaTests = require("./Time_10_piscina/piscina-all-screens.test.js");
const runExgTests = require("./exg/exg-all-screens.test.js");
const runCddTests = require("./cdd/cdd-all-screens.test.js");
const runCltTests = require("./clt/clt-all-screens.test.js");
const runFinanceTests = require("./financecar/financecar-all-screens.test.js");
const runMkpTests = require("./mkp/mkp-all-screens.test.js");


const BASE_URL = process.env.APP_URL || "http://localhost:3000";
const SCREENSHOTS_DIR = path.join(__dirname, "..", "screenshots");

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

let driver;

async function tiraFoto(name) {
  try {
    const img = await driver.takeScreenshot();
    const filePath = path.join(SCREENSHOTS_DIR, `${name}.png`);
    fs.writeFileSync(filePath, img, "base64");
    console.log(`Foto tirada ${name}.png`);
  } catch (e) {
    console.warn("Erro ao tirar a foto");
  }
}

async function main() {
  try {
    const opts = new chrome.Options();
    opts.addArguments(
      "--headless=new",
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--window-size=800,640",
      "--disable-gpu",
    );
    driver = await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(opts)
      .build();

    await driver.manage().setTimeouts({ implicit: 5000, pageLoad: 15000 });
    console.log(BASE_URL);
    await driver.get(BASE_URL + "/login");

    await tiraFoto("Pagina Entrada");

    await driver.findElement(By.id("username")).sendKeys("Adm");
    await driver.findElement(By.id("password")).sendKeys("admin");

    await tiraFoto("Valores Digitados");
    await driver.findElement(By.id("loginForm")).submit();
    await new Promise((r) => setTimeout(r, 800));

    await tiraFoto("Submit form com erro");

    const errMsg = await driver.findElement(By.css(".erro")).getText();
    if (!errMsg.includes("invalidos") && !errMsg.includes("inválidos")) {
      throw new Error(`Falhou : ${errMsg}`);
    }
  } finally {
    if (driver) await driver.quit();
  }

  console.log("\n--- Iniciando testes do MKP ---");
  await runMkpTests();

  console.log("\n--- Iniciando testes do EXG ---");
  await runExgTests();

  console.log("\n--- Iniciando testes do CDD ---");
  await runCddTests();

  console.log("\n--- Iniciando testes do CLT+ ---");
  await runCltTests();

  console.log("\n--- Iniciando testes do FinanceCar ---");
  await runFinanceTests();

  console.log("\n--- Iniciando testes da Piscina ---");
  await runPiscinaTests();
}

main().catch((err) => {
  console.error("Erro fatal", err);
  process.exit(1);
});
