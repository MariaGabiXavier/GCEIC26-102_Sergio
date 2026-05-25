const {
    BASE_URL,
    buildDriver,
    screenshot,
    click,
    type,
    By,
    until,
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
        // CASO 1: CAMPO VAZIO
        // ======================================
        await driver.get(BASE_URL + '/financecar/regra');

        await driver.wait(
            until.elementLocated(By.id('btn-calcular')),
            10000
        );

        await screenshot(driver, 'regra-pagina');

        const btnCalcular1 = await driver.findElement(
            By.id('btn-calcular')
        );

        await btnCalcular1.click();

        await driver.sleep(1000);

        await screenshot(driver, 'regra-campo-vazio');

        const erroVazio = await driver
            .findElement(By.css('.error'))
            .getText();

        if (!erroVazio.toLowerCase().includes('preencha')) {

            throw new Error(
                `Esperava erro de campos vazios, recebeu: ${erroVazio}`
            );
        }

        console.log(
            `✓ Regra: campo vazio → "${erroVazio}"`
        );

        // ======================================
        // CASO 2: VALOR INVÁLIDO
        // ======================================
        await driver.get(BASE_URL + '/financecar/regra');

        await driver.wait(
            until.elementLocated(By.id('salarioLiquido')),
            10000
        );

        await type(driver, '#salarioLiquido', '-1000');

        const btnCalcular2 = await driver.findElement(
            By.id('btn-calcular')
        );

        await btnCalcular2.click();

        await driver.sleep(1000);

        await screenshot(driver, 'regra-valor-invalido');

        const erroValor = await driver
            .findElement(By.css('.error'))
            .getText();

        if (!erroValor.toLowerCase().includes('válido')) {

            throw new Error(
                `Esperava erro de valor inválido, recebeu: ${erroValor}`
            );
        }

        console.log(
            `✓ Regra: valor inválido → "${erroValor}"`
        );

        // ======================================
        // CASO 3: CÁLCULO VÁLIDO
        // ======================================
        await driver.get(BASE_URL + '/financecar/regra');

        await driver.wait(
            until.elementLocated(By.id('salarioLiquido')),
            10000
        );

        await type(driver, '#salarioLiquido', '5000');

        const btnCalcular3 = await driver.findElement(
            By.id('btn-calcular')
        );

        await btnCalcular3.click();

        await driver.wait(
            until.elementLocated(
                By.xpath(
                    "//*[contains(text(),'Necessidades')]"
                )
            ),
            10000
        );

        await screenshot(driver, 'regra-sucesso');

        const necessidades = await driver
            .findElement(
                By.xpath(
                    "//*[contains(text(),'Necessidades')]"
                )
            )
            .getText();

        const desejos = await driver
            .findElement(
                By.xpath(
                    "//*[contains(text(),'Desejos')]"
                )
            )
            .getText();

        const investimentos = await driver
            .findElement(
                By.xpath(
                    "//*[contains(text(),'Investimentos')]"
                )
            )
            .getText();

        if (
            !necessidades.includes('Necessidades')
            ||
            !desejos.includes('Desejos')
            ||
            !investimentos.includes('Investimentos')
        ) {

            throw new Error(
                'Resultado da regra 50/30/20 não apareceu corretamente'
            );
        }

        console.log(
            '✓ Regra: cálculo realizado com sucesso'
        );

        // ======================================
        // HELP
        // ======================================
        async function testeHelpRegra() {

            console.log("\n[HELP] Regra");

            await driver.get(
                BASE_URL + '/financecar/regra'
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
                'help-regra-pagina'
            );

            await openHelpAndValidate(
                driver,
                'regra'
            );

            console.log(
                "✓ Help regra validado"
            );
        }

        await testeHelpRegra();

    } finally {

        if (driver) {
            await driver.quit();
        }
    }
}

main().catch(err => {

    console.error(
        'Erro fatal regra 50/30/20',
        err
    );

    process.exit(1);
});