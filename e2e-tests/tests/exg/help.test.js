const { BASE_URL, buildDriver, tiraFoto, autenticar, By } = require('./helpers');

async function main() {
  let driver;
  try {
    driver = await buildDriver();
    await autenticar(driver);

    await driver.get(BASE_URL + '/help');
    await tiraFoto(driver, 'help-pagina');

    const steps = await driver.findElements(By.css('.help-step'));
    if (steps.length === 0) throw new Error('Passos de uso não encontrados');
    console.log(`✓ Help: ${steps.length} passos de uso encontrados`);

    const faqItems = await driver.findElements(By.css('.faq-item'));
    if (faqItems.length === 0) throw new Error('FAQ não encontrado');
    console.log(`✓ Help: ${faqItems.length} perguntas na FAQ`);

    await faqItems[0].click();
    await new Promise(r => setTimeout(r, 400));
    await tiraFoto(driver, 'help-faq-aberto');
    console.log('✓ Help: clique na primeira pergunta OK');

    const searchInput = await driver.findElement(By.css('.help-search input'));
    await searchInput.sendKeys('IOF');
    await new Promise(r => setTimeout(r, 300));
    await tiraFoto(driver, 'help-busca-iof');

    const filtrados = await driver.findElements(By.css('.faq-item'));
    if (filtrados.length === 0) throw new Error('Busca "IOF" não retornou nenhum resultado');
    console.log(`✓ Help: busca "IOF" retornou ${filtrados.length} resultado(s)`);

  } finally {
    if (driver) await driver.quit();
  }
}

main().catch(err => { console.error('Erro fatal help', err); process.exit(1); });
