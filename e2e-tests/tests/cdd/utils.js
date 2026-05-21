const path = require('path');
const fs = require('fs');

const SCREENSHOTS_DIR = path.join(__dirname, '..', '..', 'screenshots');
if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

async function tiraFoto(driver, name) {
  try {
    const img = await driver.takeScreenshot();
    const filePath = path.join(SCREENSHOTS_DIR, `${name}.png`);
    fs.writeFileSync(filePath, img, 'base64');
    console.log(`Foto tirada ${name}.png`);
  } catch (e) {
    console.warn(`Erro ao tirar a foto ${name}`);
  }
}

async function waitVisible(driver, By, until, locator, ms = 5000) {
  return driver.wait(until.elementLocated(locator), ms);
}

async function clearAndType(driver, By, id, value) {
  const el = await driver.findElement(By.id(id));
  await el.clear();
  await el.sendKeys(value);
}

async function pause(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function safeClick(driver, By, id) {
  const el = await driver.findElement(By.id(id));
  await driver.executeScript('arguments[0].scrollIntoView({block: "center"});', el);
  await pause(100);
  await el.click();
}

module.exports = { tiraFoto, waitVisible, clearAndType, pause, safeClick, SCREENSHOTS_DIR };
