const { BASE_URL, buildDriver, tiraFoto, waitSplash, By } = require('./helpers');

module.exports = async function runSplashTest(driver = null) {
  const localDriver = driver || await buildDriver();

  try {
    await localDriver.get(`${BASE_URL}/MKP`);
    await tiraFoto(localDriver, 'MKP-01-splash');
    await waitSplash(localDriver);

    const loginCard = await localDriver.findElement(By.id('login'));
    const visible = await loginCard.isDisplayed();
    if (!visible) {
      throw new Error('Tela de login não ficou visível após o splash');
    }

    console.log('✓ Splash -> login visível');
  } finally {
    if (!driver) {
      await localDriver.quit();
    }
  }
};
