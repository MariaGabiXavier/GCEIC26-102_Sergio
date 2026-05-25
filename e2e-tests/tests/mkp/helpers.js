const fs = require('fs');
const path = require('path');
const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const BASE_URL = process.env.APP_URL || 'http://localhost:3000';
const SCREENSHOTS_DIR = path.join(__dirname, '..', '..', 'screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function buildDriver() {
  const opts = new chrome.Options();
  opts.addArguments(
    '--headless=new',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--window-size=1280,800'
  );

  const driver = await new Builder().forBrowser('chrome').setChromeOptions(opts).build();
  await driver.manage().setTimeouts({ implicit: 5000, pageLoad: 15000 });
  return driver;
}

async function tiraFoto(driver, name) {
  try {
    const img = await driver.takeScreenshot();
    fs.writeFileSync(path.join(SCREENSHOTS_DIR, `${name}.png`), img, 'base64');
    console.log(`  Criado - ${name}.png`);
  } catch (error) {
    console.warn(`  Aviso: falha ao salvar ${name}.png`);
  }
}

async function waitSplash(driver) {
  await driver.sleep(3200);
}

async function autenticar(driver) {
  await driver.get(`${BASE_URL}/MKP`);
  await waitSplash(driver);
  await driver.findElement(By.id('usuario')).clear();
  await driver.findElement(By.id('usuario')).sendKeys('admin');
  await driver.findElement(By.id('senha')).clear();
  await driver.findElement(By.id('senha')).sendKeys('1234');
  await driver.findElement(By.css('#loginForm button[type="submit"]')).click();
  await driver.wait(until.elementLocated(By.id('app')), 5000);
}

module.exports = {
  BASE_URL,
  SCREENSHOTS_DIR,
  buildDriver,
  tiraFoto,
  waitSplash,
  autenticar,
  By,
  until,
  Key
};
