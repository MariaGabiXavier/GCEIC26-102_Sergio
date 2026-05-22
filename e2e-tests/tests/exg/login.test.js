const { BASE_URL, buildDriver, tiraFoto, By, until } = require('./helpers');

async function main() {
  let driver;
  try {
    driver = await buildDriver();

    // Caso 1: campos vazios
    await driver.get(BASE_URL + '/login');
    await tiraFoto(driver, 'login-pagina');

    await driver.findElement(By.css('button[type="submit"]')).click();
    await new Promise(r => setTimeout(r, 600));
    await tiraFoto(driver, 'login-campos-vazios');

    const erroVazio = await driver.findElement(By.css('.erro')).getText();
    if (!erroVazio.toLowerCase().includes('preencha')) throw new Error(`Esperava "preencha", recebeu: ${erroVazio}`);
    console.log(`✓ Login: campos vazios → "${erroVazio}"`);

    // Caso 2: credenciais erradas
    await driver.findElement(By.id('username')).sendKeys('usuario_errado');
    await driver.findElement(By.id('password')).sendKeys('senha_errada');
    await driver.findElement(By.css('button[type="submit"]')).click();
    await new Promise(r => setTimeout(r, 1200));
    await tiraFoto(driver, 'login-credenciais-erradas');

    const erroCredenciais = await driver.findElement(By.css('.erro')).getText();
    if (!erroCredenciais.toLowerCase().includes('invalidos')) throw new Error(`Esperava "invalidos", recebeu: ${erroCredenciais}`);
    console.log(`✓ Login: credenciais erradas → "${erroCredenciais}"`);

    // Caso 3: login válido
    await driver.get(BASE_URL + '/login');
    await driver.findElement(By.id('username')).sendKeys('adm');
    await driver.findElement(By.id('password')).sendKeys('adm');
    await driver.findElement(By.css('button[type="submit"]')).click();
    await driver.wait(until.urlContains('/dashboard'), 8000);
    await tiraFoto(driver, 'login-sucesso');

    const urlFinal = await driver.getCurrentUrl();
    if (!urlFinal.includes('/dashboard')) throw new Error(`Esperava /dashboard, foi para: ${urlFinal}`);
    console.log(`✓ Login: credenciais válidas → redirecionou para /dashboard`);

  } finally {
    if (driver) await driver.quit();
  }
}

main().catch(err => { console.error('Erro fatal login', err); process.exit(1); });
