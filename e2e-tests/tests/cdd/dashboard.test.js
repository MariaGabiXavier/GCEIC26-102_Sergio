const { By } = require('selenium-webdriver');
const { tiraFoto, waitVisible, pause } = require('./utils');

module.exports = async function ({ driver, until }) {
  await driver.findElement(By.id('nav-dashboard')).click();
  await waitVisible(driver, By, until, By.id('dashboard-heading'));
  await pause(300);
  await tiraFoto(driver, 'Dashboard');

  const heading = await driver.findElement(By.id('dashboard-heading')).getText();
  if (!heading.includes('Dashboard')) {
    throw new Error(`Dashboard heading não encontrado: "${heading}"`);
  }

  const cards = await driver.findElements(By.css('#historico-list h3'));
  if (cards.length < 1) {
    throw new Error(`Histórico de cálculos vazio: ${cards.length} cards`);
  }
  console.log(`  histórico com ${cards.length} cards`);
};
