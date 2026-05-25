const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../../../.env")
});

console.log("BASE_URL:", process.env.API_URL);

const { By, until, Builder } = require("selenium-webdriver");
const fs = require("fs");

const BASE_URL = process.env.API_URL;
if(!BASE_URL){
  console.log("URL não encontrada");
}

const SCREENSHOTS_DIR = path.join(__dirname, "..", "screenshots");

// garante que a pasta existe
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

// DRIVER BUILDER
async function buildDriver() {
  return await new Builder().forBrowser("chrome").build();
}

// clique seguro
async function click(driver, selector) {
  await driver.wait(until.elementLocated(By.css(selector)), 10000);

  const el = await driver.findElement(By.css(selector));
  await driver.wait(until.elementIsVisible(el), 10000);

  await el.click();
}

// digitar seguro
async function type(driver, selector, value) {
  await driver.wait(until.elementLocated(By.css(selector)), 10000);

  const el = await driver.findElement(By.css(selector));
  await driver.wait(until.elementIsVisible(el), 10000);

  await el.clear();
  await el.sendKeys(value);
}
// esperar elemento aparecer
async function waitFor(driver, selector, timeout = 5000) {
  await driver.wait(until.elementLocated(By.css(selector)), timeout);
}

// verificar existência
async function exists(driver, selector) {
  const els = await driver.findElements(By.css(selector));
  return els.length > 0;
}

// screenshot (AGORA NÃO ESCONDE ERRO)
async function screenshot(driver, name) {
  try {
    const img = await driver.takeScreenshot();

    fs.writeFileSync(
      path.join(SCREENSHOTS_DIR, `FINANCECAR-${name}.png`),
      img,
      "base64"
    );

    console.log(`📸 ${name}.png`);
  } catch (e) {
    console.error("❌ erro screenshot:", e);
    throw e;
  }
}

// help modal
async function openHelpAndValidate(driver, pageName) {

  await click(driver, ".help-btn");

  // espera overlay ficar visível
  const overlay = await driver.wait(
    until.elementLocated(By.css(".overlay")),
    10000
  );

  await driver.wait(
    until.elementIsVisible(overlay),
    10000
  );

  // valida modal também
  const modal = await driver.findElement(
    By.css(".modal")
  );

  await driver.wait(
    until.elementIsVisible(modal),
    10000
  );

  await screenshot(
    driver,
    `help-${pageName}`
  );

  return true;
}

async function closeHelp(driver) {

  const overlay = await driver.findElement(
    By.css(".overlay")
  );

  await overlay.click();

  await driver.wait(
    until.elementIsNotVisible(overlay),
    10000
  );
}

// autenticação (corrigida e reutilizável)
async function autenticar(driver) {

  const email = "adm"
  const password = "adm"

  await driver.get(BASE_URL + "/financecar/login");

  await type(driver, 'input[type="text"]', email);
  await type(driver, 'input[type="password"]', password);

  await click(driver, 'button[type="submit"]');

  await driver.wait(until.urlContains("/home"), 3000);

  const url = await driver.getCurrentUrl();

  if (!url.includes("/home")) {
    throw new Error(`Login falhou. URL atual: ${url}`);
  }

  console.log("✓ Auth: login realizado com sucesso");
}

module.exports = {
  BASE_URL,
  buildDriver,
  screenshot,
  By,
  click,
  type,
  waitFor,
  exists,
  openHelpAndValidate,
  closeHelp,
  autenticar,
  until
};