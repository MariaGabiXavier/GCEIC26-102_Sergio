const { BASE_URL, buildDriver, tiraFoto, autenticar, By, until } = require('./helpers');

async function main() {
  let driver;
  try {
    driver = await buildDriver();
    await autenticar(driver);

    await driver.get(BASE_URL + '/exchange');
    await tiraFoto(driver, 'exchange-pagina');

    await driver.wait(until.elementLocated(By.css('#currency option')), 10000);

    await driver.findElement(By.id('value')).sendKeys('1000');
    await tiraFoto(driver, 'exchange-preenchido');

    await driver.findElement(By.css('button[type="submit"]')).click();
    await new Promise(r => setTimeout(r, 2000));
    await driver.wait(until.elementLocated(By.css('.result-card')), 8000);
    await tiraFoto(driver, 'exchange-resultado');

    const valorFinal = await driver.findElement(By.css('.result-final-value')).getText();
    if (!valorFinal || valorFinal.trim() === '') throw new Error('Valor convertido vazio');
    console.log(`✓ Exchange: conversão realizada → ${valorFinal}`);

  } finally {
    if (driver) await driver.quit();
  }
}

main().catch(err => { console.error('Erro fatal exchange', err); process.exit(1); });
