const {
    BASE_URL,
    buildDriver,
    screenshot,
    By,
    until,
    type,
    click,
    openHelpAndValidate
} = require('./helpers');

async function main() {

    let driver;

    try {

        driver = await buildDriver();

        await driver.manage().window().setRect({
            width: 1400,
            height: 900
        });

        // ======================================
        // LOGIN
        // ======================================
        await driver.get(BASE_URL + '/financecar/login');

        await type(driver, '#email', 'adm');
        await type(driver, '#password', 'adm');

        await click(driver, 'button');

        await driver.wait(
            until.urlContains('/financecar'),
            10000
        );

        // ======================================
        // CASO 1: CAMPOS VAZIOS
        // ======================================
        await driver.get(BASE_URL + '/financecar/juros');

        await driver.wait(
            until.elementLocated(By.id('btn-calcular')),
            10000
        );

        await screenshot(driver, 'juros-pagina');

        const btnCalcular1 = await driver.findElement(
            By.id('btn-calcular')
        );

        await btnCalcular1.click();

        await driver.sleep(1000);

        await screenshot(driver, 'juros-campos-vazios');

        const erroVazio = await driver
            .findElement(By.css('.error'))
            .getText();

        if (!erroVazio.toLowerCase().includes('preencha')) {

            throw new Error(
                `Esperava erro de campos vazios, recebeu: ${erroVazio}`
            );
        }

        console.log(
            `✓ Juros: campos vazios → "${erroVazio}"`
        );

        // ======================================
        // CASO 2: VALORES INVÁLIDOS
        // ======================================
        await driver.get(BASE_URL + '/financecar/juros');

        await driver.wait(
            until.elementLocated(By.id('valorInicial')),
            10000
        );

        await type(driver, '#valorInicial', '-100');
        await type(driver, '#aporteMensal', '10');
        await type(driver, '#taxaJuros', '0');
        await type(driver, '#tempo', '0');

        const btnCalcular2 = await driver.findElement(
            By.id('btn-calcular')
        );

        await btnCalcular2.click();

        await driver.wait(
            until.elementLocated(By.css('.error')),
            10000
        );

        await screenshot(driver, 'juros-valores-invalidos');

        const erroValores = await driver
            .findElement(By.css('.error'))
            .getText();

        if (!erroValores.toLowerCase().includes('válidos')) {

            throw new Error(
                `Esperava erro de valores inválidos, recebeu: ${erroValores}`
            );
        }

        console.log(
            `✓ Juros: valores inválidos → "${erroValores}"`
        );

        // ======================================
        // CASO 3: CÁLCULO VÁLIDO
        // ======================================
        await driver.get(BASE_URL + '/financecar/juros');

        await driver.wait(
            until.elementLocated(By.id('valorInicial')),
            10000
        );

        await type(driver, '#valorInicial', '1000');
        await type(driver, '#aporteMensal', '100');
        await type(driver, '#taxaJuros', '1');
        await type(driver, '#tempo', '12');

        const btnCalcular3 = await driver.findElement(
            By.id('btn-calcular')
        );

        await btnCalcular3.click();

        const resultadoElemento = await driver.findElement(
            By.id('resultadoMsg')
        );

        await driver.wait(
            async () => {

                const texto =
                    await resultadoElemento.getText();

                return texto.trim().length > 0;

            },
            10000
        );

        await screenshot(driver, 'juros-sucesso');

        const resultado =
            await resultadoElemento.getText();

        if (
            !resultado.toLowerCase().includes('montante')
            &&
            !resultado.toLowerCase().includes('resultado')
            &&
            !resultado.toLowerCase().includes('r$')
        ) {

            throw new Error(
                `Esperava resultado dos juros compostos, recebeu: ${resultado}`
            );
        }

        console.log(
            `✓ Juros: cálculo realizado com sucesso → "${resultado}"`
        );

        // ======================================
        // HELP
        // ======================================
        async function testeHelpJuros() {

            console.log("\n[HELP] Juros");

            await driver.get(
                BASE_URL + '/financecar/juros'
            );

            await driver.wait(
                async () => {

                    const state =
                        await driver.executeScript(
                            'return document.readyState'
                        );

                    return state === 'complete';

                },
                10000
            );

            await driver.wait(
                until.elementLocated(
                    By.css('.help-btn')
                ),
                5000
            );

            await screenshot(
                driver,
                'help-juros-pagina'
            );

            await openHelpAndValidate(
                driver,
                'juros'
            );

            console.log(
                "✓ Help juros validado"
            );
        }

        await testeHelpJuros();

    } finally {

        if (driver) {
            await driver.quit();
        }
    }
}

main().catch(err => {

    console.error(
        'Erro fatal juros compostos',
        err
    );

    process.exit(1);
});