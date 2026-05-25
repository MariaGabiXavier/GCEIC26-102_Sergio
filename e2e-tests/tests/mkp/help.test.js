const { BASE_URL, tiraFoto, autenticar, By } = require('./helpers');

module.exports = async function runHelpTest(driver) {
  await autenticar(driver);
  await driver.findElement(By.id('btnHelp')).click();
  await driver.sleep(400);
  await tiraFoto(driver, 'MKP-10-help');

  const title = await driver.findElement(By.css('#help h2')).getText();
  if (!title.toLowerCase().includes('central de ajuda')) {
    throw new Error(`Título inesperado na tela de Ajuda: ${title}`);
  }

  const formulaBox = await driver.findElement(By.css('.formula-box')).getText();
  if (!formulaBox.includes('Markup = 100')) {
    throw new Error(`Fórmula não encontrada na central de ajuda: ${formulaBox}`);
  }

  console.log('✓ Ajuda/FAQ validado');
};
