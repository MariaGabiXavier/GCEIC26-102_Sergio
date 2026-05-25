const {
    BASE_URL,
    buildDriver,
    screenshot,
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

        // abre aplicação
        await driver.get(BASE_URL + "/financecar");

        // espera splash aparecer
        const logo = await driver.wait(
            until.elementLocated(
                By.css('.logo-splash')
            ),
            3000
        );

        console.log('✓ Splash apareceu');

        await screenshot(
            driver,
            'splash-pagina'
        );

        // espera splash sumir
        await driver.wait(
            until.stalenessOf(logo),
            6000
        );

        console.log('✓ Splash desapareceu');

        // valida login
        await driver.wait(
            until.urlContains('/financecar/login'),
            5000
        );

        console.log(
            '✓ Foi para login'
        );

        await screenshot(
            driver,
            'login-pagina'
        );

    } catch (err) {

        console.error(
            'Erro fatal splash',
            err
        );

    } finally {

        if (driver) {
            await driver.quit();
        }
    }
}

main();