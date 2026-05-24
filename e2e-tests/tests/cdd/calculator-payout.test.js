const { By } = require('selenium-webdriver');
const { tiraFoto, waitVisible, clearAndType, pause } = require('./utils');

module.exports = async function ({ driver, until }) {
  await driver.findElement(By.id('tab-payout')).click();
  await waitVisible(driver, By, until, By.id('payout-dps'));
  await pause(200);

  await clearAndType(driver, By, 'payout-dps', '2.50');
  await clearAndType(driver, By, 'payout-eps', '4.00');
  await driver.findElement(By.id('payout-calcular')).click();

  await waitVisible(driver, By, until, By.id('payout-result'));
  await pause(200);

  const payout = await driver.findElement(By.id('payout-value')).getText();
  const ret = await driver.findElement(By.id('payout-retention')).getText();
  const risk = await driver.findElement(By.id('payout-risk')).getText();
  const status = await driver.findElement(By.id('payout-status')).getText();

  await tiraFoto(driver, 'Calculator Payout - Resultado');

  if (!payout.includes('62.5')) throw new Error(`Payout esperado 62.5%, obtido "${payout}"`);
  if (!ret.includes('37.5')) throw new Error(`Retention esperado 37.5%, obtido "${ret}"`);
  if (!risk.toLowerCase().includes('moderate')) throw new Error(`Risco esperado 'moderate', obtido: "${risk}"`);
  if (!status.toLowerCase().includes('sustent')) throw new Error(`Status esperado 'Sustentável', obtido: "${status}"`);
  console.log(`  payout: ${payout} | ret: ${ret} | risk: ${risk} | status: ${status}`);
};
