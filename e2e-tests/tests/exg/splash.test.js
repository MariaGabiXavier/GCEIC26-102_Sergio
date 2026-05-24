const { BASE_URL, buildDriver, tiraFoto, By } = require('./helpers');

async function main() {
  let driver;
  try {
    driver = await buildDriver();

    await driver.get(BASE_URL + '/');
    await tiraFoto(driver, 'splash-pagina');

    const logo = await driver.findElement(By.css('.splash-logo'));
    const logoText = await logo.getText();
    if (!logoText.includes('EXG')) throw new Error(`Logo incorreto: ${logoText}`);

    const subtitle = await driver.findElement(By.css('.splash-subtitle'));
    const subtitleText = await subtitle.getText();
    if (!subtitleText) throw new Error('Subtítulo não encontrado');

    console.log(`✓ Splash: logo "${logoText}" e subtítulo "${subtitleText}" verificados`);
  } finally {
    if (driver) await driver.quit();
  }
}

main().catch(err => { console.error('Erro fatal splash', err); process.exit(1); });
