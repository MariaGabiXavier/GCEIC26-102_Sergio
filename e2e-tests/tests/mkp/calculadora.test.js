const { BASE_URL, tiraFoto, autenticar, By, until } = require('./helpers');

module.exports = async function runCalculadoraTest(driver) {
  await autenticar(driver);

  await driver.findElement(By.id('btnPrincipal')).click();
  await driver.sleep(300);

  await driver.findElement(By.id('custoProduto')).clear();
  await driver.findElement(By.id('custoProduto')).sendKeys('50');
  await driver.findElement(By.id('despesasVariaveis')).clear();
  await driver.findElement(By.id('despesasVariaveis')).sendKeys('10');
  await driver.findElement(By.id('despesasFixas')).clear();
  await driver.findElement(By.id('despesasFixas')).sendKeys('15');
  await driver.findElement(By.id('margemLucro')).clear();
  await driver.findElement(By.id('margemLucro')).sendKeys('20');

  await tiraFoto(driver, 'MKP-07-calculadora-preenchida');
  await driver.findElement(By.css('#calcForm button[type="submit"]')).click();
  await driver.wait(async () => {
    const box = await driver.findElement(By.id('resultadoBox'));
    const displayed = await box.isDisplayed();
    if (!displayed) return false;

    const multiplicador = await driver.findElement(By.id('multiplicadorText')).getText();
    const precoVenda = await driver.findElement(By.id('precoVendaText')).getText();
    return multiplicador.includes('1.82') && precoVenda.includes('90.91');
  }, 5000, 'Resultado da calculadora não ficou pronto a tempo');
  await tiraFoto(driver, 'MKP-08-calculadora-resultado');

  const multiplicador = await driver.findElement(By.id('multiplicadorText')).getText();
  const precoVenda = await driver.findElement(By.id('precoVendaText')).getText();

  if (!multiplicador.includes('1.82') || !precoVenda.includes('90.91')) {
    throw new Error(`Resultado inesperado: ${multiplicador} / ${precoVenda}`);
  }

  console.log('✓ Calculadora validada');
};
