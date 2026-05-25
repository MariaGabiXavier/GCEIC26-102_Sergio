const { BASE_URL, tiraFoto, waitSplash, By, until } = require('./helpers');

module.exports = async function runLoginValidoTest(driver) {
  await driver.get(`${BASE_URL}/MKP`);
  await waitSplash(driver);

  await driver.findElement(By.id('usuario')).clear();
  await driver.findElement(By.id('usuario')).sendKeys('admin');
  await driver.findElement(By.id('senha')).clear();
  await driver.findElement(By.id('senha')).sendKeys('1234');
  await tiraFoto(driver, 'MKP-04-login-preenchido');
  await driver.findElement(By.css('#loginForm button[type="submit"]')).click();
  await driver.wait(until.elementLocated(By.id('app')), 5000);
  await tiraFoto(driver, 'MKP-05-login-sucesso');

  const appVisible = await driver.findElement(By.id('app')).isDisplayed();
  if (!appVisible) {
    throw new Error('Dashboard não abriu após login válido');
  }

  console.log('✓ Login válido validado');
};
