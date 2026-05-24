const { By } = require('selenium-webdriver');
const { tiraFoto, waitVisible, pause } = require('./utils');

module.exports = async function ({ driver, until }) {
  await driver.findElement(By.id('nav-about')).click();
  await waitVisible(driver, By, until, By.id('about-heading'));
  await pause(300);
  await tiraFoto(driver, 'About');

  const html = await driver.getPageSource();
  for (const nome of ['Letícia Sumida', 'Lucas Ranzani', 'Luis Silva']) {
    if (!html.includes(nome)) throw new Error(`Nome não encontrado em About: ${nome}`);
  }
  console.log(`  3 integrantes da equipe presentes`);
};
