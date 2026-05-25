const { BASE_URL, tiraFoto, autenticar, By } = require('./helpers');

module.exports = async function runSobreTest(driver) {
  await autenticar(driver);
  await driver.findElement(By.id('btnSobre')).click();
  await driver.sleep(400);
  await tiraFoto(driver, 'MKP-09-sobre');

  const title = await driver.findElement(By.css('#sobre h2')).getText();
  if (!title.toLowerCase().includes('conheça nossa equipe')) {
    throw new Error(`Título inesperado na tela Sobre: ${title}`);
  }

  const teamCards = await driver.findElements(By.css('.team-card'));
  if (teamCards.length < 3) {
    throw new Error(`Esperava 3 cards de equipe, encontrei ${teamCards.length}`);
  }

  console.log('✓ Sobre/equipe validado');
};
