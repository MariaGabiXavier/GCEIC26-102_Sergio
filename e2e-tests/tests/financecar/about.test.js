const {
    BASE_URL,
    buildDriver,
    screenshot,
    autenticar,
    By,
    until
} = require('./helpers');

async function main() {

    let driver;

    try {

        driver = await buildDriver();

        await driver.manage().window().setRect({
            width: 1400,
            height: 900
        });

        await autenticar(driver);

        await driver.get(BASE_URL + '/financecar/sobre');
        await screenshot(driver, 'sobre-pagina');

        // ======================================
        // TÍTULO
        // ======================================
        const titulo = await driver.findElement(By.css('.hero-sobre h1'));
        const tituloTexto = await titulo.getText();

        if (!tituloTexto.includes('FinanceCar')) {
            throw new Error(`Título incorreto: ${tituloTexto}`);
        }

        console.log(`✓ Sobre: título "${tituloTexto}" verificado`);

        // ======================================
        // CARDS EQUIPE
        // ======================================
        const cardsEquipe = await driver.findElements(By.css('.card-sobre'));

        if (cardsEquipe.length === 0) {
            throw new Error('Cards da equipe não encontrados');
        }

        console.log(`✓ Sobre: ${cardsEquipe.length} cards encontrados`);

        // ======================================
        // NOMES EQUIPE
        // ======================================
        const nomes = await driver.findElements(By.css('.card-sobre h2'));

        if (nomes.length < 3) {
            throw new Error('Nem todos os membros da equipe foram encontrados');
        }

        console.log(`✓ Sobre: ${nomes.length} nomes encontrados`);

        // ======================================
        // BOTÃO LOGOUT
        // ======================================
        const logoutButtons = await driver.findElements(By.css('.logout'));

        if (logoutButtons.length === 0) {
            throw new Error('Botão logout não encontrado');
        }

        console.log('✓ Sobre: botão logout encontrado');

        await logoutButtons[0].click();

        // ======================================
        // POPUP LOGOUT
        // ======================================
        await driver.wait(
            until.elementLocated(By.css('.popup')),
            5000
        );

        await screenshot(driver, 'sobre-popup-logout');

        const popups = await driver.findElements(By.css('.popup'));

        if (popups.length === 0) {
            throw new Error('Popup de logout não apareceu');
        }

        console.log('✓ Sobre: popup logout aberto');

        // ======================================
        // BOTÃO CANCELAR
        // ======================================
        const cancelarButtons = await driver.findElements(By.css('.cancelar'));

        if (cancelarButtons.length === 0) {
            throw new Error('Botão cancelar não encontrado');
        }

        await cancelarButtons[0].click();

        console.log('✓ Sobre: popup fechado com sucesso');

    } finally {
        if (driver) {
            await driver.quit();
        }
    }
}

main().catch(err => {
    console.error('Erro fatal sobre', err);
    process.exit(1);
});