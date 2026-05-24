const { By } = require('selenium-webdriver');
const { tiraFoto, waitVisible, clearAndType, pause } = require('./utils');

module.exports = async function ({ driver, until }) {
  await driver.findElement(By.id('tab-drip')).click();
  await waitVisible(driver, By, until, By.id('drip-initial'));
  await pause(200);

  await clearAndType(driver, By, 'drip-initial', '10000');
  await clearAndType(driver, By, 'drip-yield', '8');
  await clearAndType(driver, By, 'drip-years', '10');
  // frequência fica no default (Mensal)
  await driver.findElement(By.id('drip-simular')).click();

  await waitVisible(driver, By, until, By.id('drip-table'));
  await pause(300);

  const rows = await driver.findElements(By.css('#drip-table tbody tr'));
  const fv = await driver.findElement(By.id('drip-future-value')).getText();

  await tiraFoto(driver, 'Calculator DRIP - Resultado');

  if (rows.length !== 10) throw new Error(`Esperado 10 linhas na tabela, obtido ${rows.length}`);
  if (!fv.includes('R$')) throw new Error(`Valor futuro sem formatação BRL: "${fv}"`);
  console.log(`  linhas: ${rows.length} | valor futuro: ${fv}`);
};
