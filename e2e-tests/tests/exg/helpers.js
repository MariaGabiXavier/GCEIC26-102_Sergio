const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.APP_URL || 'http://localhost:5173';
const TOKEN = 'token-simulado-123';
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

async function buildDriver() {
  const opts = new chrome.Options();
  opts.addArguments(
    '--headless=new',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--window-size=1280,800',
    '--disable-gpu'
  );
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(opts).build();
  await driver.manage().setTimeouts({ implicit: 5000, pageLoad: 15000 });
  return driver;
}

async function tiraFoto(driver, name) {
  try {
    const img = await driver.takeScreenshot();
    fs.writeFileSync(path.join(SCREENSHOTS_DIR, `${name}.png`), img, 'base64');
    console.log(`  Foto: ${name}.png`);
  } catch (e) {
    console.warn('  Aviso: erro ao tirar foto');
  }
}

async function autenticar(driver) {
  await driver.get(BASE_URL + '/login');
  await driver.executeScript(`localStorage.setItem('exg_token', '${TOKEN}')`);
}

module.exports = { BASE_URL, TOKEN, buildDriver, tiraFoto, autenticar, By, until };
