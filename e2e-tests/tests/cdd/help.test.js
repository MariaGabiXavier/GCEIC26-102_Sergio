const { By } = require('selenium-webdriver');
const { tiraFoto, waitVisible, safeClick, pause } = require('./utils');

module.exports = async function ({ driver, until }) {
  await driver.findElement(By.id('nav-help')).click();
  await waitVisible(driver, By, until, By.id('help-tab-yield'));

  // Aba Yield (default mas garante)
  await safeClick(driver, By, 'help-tab-yield');
  await pause(300);
  let formula = await driver.findElement(By.id('help-formula')).getText();
  if (!formula.includes('DY')) throw new Error(`Fórmula DY ausente: "${formula}"`);
  await tiraFoto(driver, 'Help DY');

  // Próxima fact deve mudar texto
  const fact1 = await driver.findElement(By.id('help-fact-text')).getText();
  await safeClick(driver, By, 'help-next-fact');
  await pause(300);
  const fact2 = await driver.findElement(By.id('help-fact-text')).getText();
  if (fact1 === fact2) throw new Error('Fact não trocou após clicar em "próxima"');

  // Aba Payout
  await safeClick(driver, By, 'help-tab-payout');
  await pause(300);
  formula = await driver.findElement(By.id('help-formula')).getText();
  if (!formula.includes('Payout')) throw new Error(`Fórmula Payout ausente: "${formula}"`);
  await tiraFoto(driver, 'Help Payout');

  // Aba DRIP
  await safeClick(driver, By, 'help-tab-drip');
  await pause(300);
  formula = await driver.findElement(By.id('help-formula')).getText();
  if (!formula.includes('Valor Futuro') && !formula.toLowerCase().includes('drip')) {
    throw new Error(`Fórmula DRIP ausente: "${formula}"`);
  }
  await tiraFoto(driver, 'Help DRIP');
  console.log('  3 abas validadas (DY, Payout, DRIP)');
};
