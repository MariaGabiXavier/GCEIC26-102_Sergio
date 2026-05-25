const { BASE_URL, tiraFoto, autenticar, By } = require('./helpers');

module.exports = async function runDashboardTest(driver) {
  await autenticar(driver);
  await tiraFoto(driver, 'MKP-06-dashboard');

  const sidebar = await driver.findElement(By.css('.sidebar'));
  const sidebarVisible = await sidebar.isDisplayed();
  if (!sidebarVisible) {
    throw new Error('Sidebar não está visível');
  }

  const principalBtn = await driver.findElement(By.id('btnPrincipal')).getText();
  const sobreBtn = await driver.findElement(By.id('btnSobre')).getText();
  const helpBtn = await driver.findElement(By.id('btnHelp')).getText();

  if (!principalBtn || !sobreBtn || !helpBtn) {
    throw new Error('Botões principais da sidebar não foram encontrados');
  }

  console.log('✓ Dashboard/sidebar validado');
};
