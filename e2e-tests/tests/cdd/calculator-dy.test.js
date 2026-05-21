const { By } = require('selenium-webdriver');
const { tiraFoto, waitVisible, clearAndType, pause } = require('./utils');

module.exports = async function ({ driver, until }) {
  await driver.findElement(By.id('nav-calculators')).click();
  await waitVisible(driver, By, until, By.id('tab-yield'));
  await driver.findElement(By.id('tab-yield')).click();
  await pause(300);
  await tiraFoto(driver, 'Calculator DY - Inicial');

  await clearAndType(driver, By, 'dy-dividend', '2.80');
  await clearAndType(driver, By, 'dy-price', '32.50');
  await driver.findElement(By.id('dy-calcular')).click();

  await waitVisible(driver, By, until, By.id('dy-result-value'));
  await pause(200);
  const value = await driver.findElement(By.id('dy-result-value')).getText();
  const cls = await driver.findElement(By.id('dy-result-class')).getText();

  await tiraFoto(driver, 'Calculator DY - Resultado');

  if (!value.includes('8.62')) throw new Error(`DY esperado 8.62%, obtido "${value}"`);
  if (!cls.toLowerCase().includes('high')) throw new Error(`Classificação esperada 'high', obtida: "${cls}"`);
  console.log(`  resultado: ${value} | ${cls}`);
};
