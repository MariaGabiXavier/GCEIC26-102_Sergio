const { BASE_URL, tiraFoto, waitSplash, By } = require('./helpers');

module.exports = async function runLoginInvalidoTest(driver) {
  await driver.get(`${BASE_URL}/MKP`);
  await waitSplash(driver);

  await driver.findElement(By.id('usuario')).clear();
  await driver.findElement(By.id('usuario')).sendKeys('usuarioInvalido');
  await driver.findElement(By.id('senha')).clear();
  await driver.findElement(By.id('senha')).sendKeys('0000');
  await tiraFoto(driver, 'MKP-02-login-preenchido-invalido');

  await driver.findElement(By.css('#loginForm button[type="submit"]')).click();
  await driver.sleep(500);
  await tiraFoto(driver, 'MKP-03-login-invalido-erro');

  const errorText = await driver.findElement(By.id('loginErro')).getText();
  if (!errorText.toLowerCase().includes('usuário ou senha incorretos')) {
    throw new Error(`Erro inesperado para credenciais inválidas: ${errorText}`);
  }

  console.log('✓ Login inválido validado');
};
