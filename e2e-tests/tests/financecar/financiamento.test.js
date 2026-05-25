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
        await driver.get(BASE_URL + '/financecar/financiamento');

        await driver.wait(
            until.elementLocated(By.id('btn-calcular')),
            10000
        );

        await screenshot(driver, 'financiamento-pagina');

        const btnCalcular1 = await driver.findElement(
            By.id('btn-calcular')
        );

        await btnCalcular1.click();

        await driver.sleep(1000);

        await screenshot(driver, 'financiamento-campos-vazios');

        const erroVazio = await driver
            .findElement(By.id('errorMsg'))
            .getText();

        if (!erroVazio.toLowerCase().includes('preencha')) {
            throw new Error(
                `Esperava erro de campos vazios, recebeu: ${erroVazio}`
            );
        }

        console.log(
            `✓ Financiamento: campos vazios → "${erroVazio}"`
        );

        // ======================================
        // CASO 2: VALORES INVÁLIDOS
        // ======================================
        await driver.get(BASE_URL + '/financecar/financiamento');

        await driver.wait(
            until.elementLocated(By.id('valorVeiculo')),
            10000
        );

        await type(driver, '#valorVeiculo', '-50000');
        await type(driver, '#entrada', '-1000');
        await type(driver, '#taxaJuros', '0');
        await type(driver, '#parcelas', '0');

        const btnCalcular2 = await driver.findElement(
            By.id('btn-calcular')
        );

        await btnCalcular2.click();

        await driver.sleep(1000);

        await screenshot(driver, 'financiamento-valores-invalidos');

        const erroValores = await driver
            .findElement(By.id('errorMsg'))
            .getText();

        if (!erroValores.toLowerCase().includes('válidos')) {
            throw new Error(
                `Esperava erro de valores inválidos, recebeu: ${erroValores}`
            );
        }

        console.log(
            `✓ Financiamento: valores inválidos → "${erroValores}"`
        );

        // ======================================
        // CASO 3: CÁLCULO VÁLIDO
        // ======================================
        await driver.get(BASE_URL + '/financecar/financiamento');

        await driver.wait(
            until.elementLocated(By.id('valorVeiculo')),
            10000
        );

        await type(driver, '#valorVeiculo', '50000');
        await type(driver, '#entrada', '10000');
        await type(driver, '#taxaJuros', '1.5');
        await type(driver, '#parcelas', '48');

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

        await screenshot(driver, 'financiamento-sucesso');

        const resultado = await resultadoElemento.getText();

        if (!resultado.toLowerCase().includes('parcela')) {
            throw new Error(
                `Esperava resultado de parcela, recebeu: ${resultado}`
            );
        }

        console.log(
            `✓ Financiamento: cálculo realizado com sucesso → "${resultado}"`
        );

        // ======================================
        // HELP
        // ======================================
        async function testeHelpFinanciamento() {

            console.log("\n[HELP] Financiamento");

            await driver.get(
                BASE_URL + '/financecar/financiamento'
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
                'help-financiamento-pagina'
            );

            await openHelpAndValidate(
                driver,
                'financiamento'
            );

            console.log(
                "✓ Help financiamento validado"
            );
        }

        await testeHelpFinanciamento();

    } finally {

        if (driver) {
            await driver.quit();
        }
    }
}

main().catch(err => {
    console.error('Erro fatal financiamento', err);
    process.exit(1);
});