const { BASE_URL, buildDriver, tiraFoto, autenticar, By } = require('./helpers');

async function main() {
  let driver;
  try {
    driver = await buildDriver();
    await autenticar(driver);

    await driver.get(BASE_URL + '/about');
    await tiraFoto(driver, 'about-pagina');

    const logo = await driver.findElement(By.css('.about-logo'));
    const logoText = await logo.getText();
    if (!logoText.includes('EXG')) throw new Error(`Logo about incorreto: ${logoText}`);
    console.log(`✓ About: logo "${logoText}" verificado`);

    const membros = await driver.findElements(By.css('.team-member'));
    if (membros.length === 0) throw new Error('Membros da equipe não encontrados');
    console.log(`✓ About: ${membros.length} membros da equipe encontrados`);

    const infoCards = await driver.findElements(By.css('.about-info-card'));
    if (infoCards.length === 0) throw new Error('Cards de informação não encontrados');
    console.log(`✓ About: ${infoCards.length} cards de informação encontrados`);

  } finally {
    if (driver) await driver.quit();
  }
}

main().catch(err => { console.error('Erro fatal about', err); process.exit(1); });
