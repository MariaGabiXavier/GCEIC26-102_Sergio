const { BASE_URL, buildDriver, tiraFoto, autenticar, By, until } = require('./helpers');

async function main() {
  let driver;
  try {
    driver = await buildDriver();
    await autenticar(driver);

    await driver.get(BASE_URL + '/dashboard');
    await tiraFoto(driver, 'dashboard-carregando');

    await driver.wait(until.elementLocated(By.css('.currency-grid')), 10000);
    await tiraFoto(driver, 'dashboard-carregado');

    const cards = await driver.findElements(By.css('.currency-card'));
    if (cards.length === 0) throw new Error('Nenhum card de moeda encontrado');
    console.log(`✓ Dashboard: ${cards.length} moedas carregadas`);

    const navLinks = await driver.findElements(By.css('.nav-link'));
    if (navLinks.length === 0) throw new Error('Navegação não encontrada');
    console.log(`✓ Dashboard: ${navLinks.length} links de navegação`);

    const logout = await driver.findElement(By.css('.header-logout'));
    const logoutText = await logout.getText();
    if (!logoutText) throw new Error('Botão de logout não encontrado');
    console.log(`✓ Dashboard: botão "${logoutText}" presente`);

  } finally {
    if (driver) await driver.quit();
  }
}

main().catch(err => { console.error('Erro fatal dashboard', err); process.exit(1); });
