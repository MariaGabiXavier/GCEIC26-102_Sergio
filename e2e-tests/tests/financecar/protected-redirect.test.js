const {
    BASE_URL,
    buildDriver,
    screenshot,
    By,
    until
} = require('./helpers');

const ROTAS_PROTEGIDAS = [
    '/financecar/home',
    '/financecar/juros',
    '/financecar/financiamento',
    '/financecar/fundo',
    '/financecar/regra',
    '/financecar/sobre'
];

// ======================================
// HELPERS
// ======================================

async function openLogin(driver) {
    await driver.get(BASE_URL + '/financecar/login');

    await driver.wait(
        until.urlContains('/login'),
        10000
    );

    await driver.sleep(1000);

    await screenshot(driver, 'protected-login-pagina');
}

async function isRedirectedToLogin(driver, timeout = 15000) {
    try {
        await driver.wait(async () => {
            const url = await driver.getCurrentUrl();
            return url.includes('/login');
        }, timeout);

        return true;

    } catch {
        return false;
    }
}

// ======================================
// MAIN TEST
// ======================================

async function main() {

    let driver;

    try {

        driver = await buildDriver();

        await driver.manage().window().setRect({
            width: 1400,
            height: 900
        });

        // ======================================
        // LIMPA SESSÃO
        // ======================================
        await openLogin(driver);

        await driver.executeScript(`
            localStorage.clear();
            sessionStorage.clear();
        `);

        // ======================================
        // TESTE ROTAS PROTEGIDAS
        // ======================================
        for (const rota of ROTAS_PROTEGIDAS) {

            const urlTeste = BASE_URL + rota;

            console.log('\n========================');
            console.log('Testando rota:', urlTeste);

            await driver.get(urlTeste);

            const redirecionou = await isRedirectedToLogin(driver);

            const nomeScreenshot = `protected-${rota.replace(/\//g, '-')}`;

            await screenshot(driver, nomeScreenshot);

            if (redirecionou) {
                console.log(`✓ ${rota} redirecionou para login`);
            } else {
                console.log(`❌ ${rota} NÃO redirecionou`);
                throw new Error(`Rota protegida falhou: ${rota}`);
            }
        }

        console.log('\n✓ Todos os testes de rotas protegidas passaram');

    } catch (err) {

        console.error('Erro fatal rotas protegidas', err);

        if (driver) {
            console.log(await driver.getCurrentUrl());
        }

        throw err;

    } finally {

        if (driver) {
            await driver.quit();
        }
    }
}

main().catch(err => {
    console.error('Erro fatal rotas protegidas', err);
    process.exit(1);
});