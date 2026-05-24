const { BASE_URL, buildDriver, tiraFoto, By, until } = require('./helpers');

const ROTAS_PROTEGIDAS = ['/dashboard', '/exchange', '/about', '/help'];

async function main() {
  let driver;
  try {
    driver = await buildDriver();

    // Garante que não há token
    await driver.get(BASE_URL + '/login');
    await driver.executeScript("localStorage.removeItem('exg_token')");

    for (const rota of ROTAS_PROTEGIDAS) {
      await driver.get(BASE_URL + rota);
      await driver.wait(until.urlContains('/login'), 5000);
      await tiraFoto(driver, `redirect${rota.replace('/', '-')}`);

      const url = await driver.getCurrentUrl();
      if (!url.includes('/login')) throw new Error(`${rota} não redirecionou para /login (url: ${url})`);
      console.log(`✓ ${rota} → redirecionou para /login sem token`);
    }
  } finally {
    if (driver) await driver.quit();
  }
}

main().catch(err => { console.error('Erro fatal protected-redirect', err); process.exit(1); });
