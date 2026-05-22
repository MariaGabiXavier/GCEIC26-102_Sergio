const { Builder, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = path.join(
    __dirname,
    '..',
    '..',
    'screenshots',
    'Time_2(ETEC1)'
);

if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

let driver;

async function tiraFoto(nome) {
    try {
        const imagem = await driver.takeScreenshot();

        fs.writeFileSync(
            path.join(SCREENSHOTS_DIR, `${nome}.png`),
            imagem,
            'base64'
        );

        console.log(`📸 Foto tirada: ${nome}.png`);
    } catch (e) {
        console.warn('Erro ao tirar foto:', e.message);
    }
}

async function main() {

    try {

        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(
                new chrome.Options().addArguments('--headless=new')
            )
            .build();

        await driver.get('http://localhost:3000/ETEC1/calculo');

        await tiraFoto('ETEC1_calculo_aberto');

        await driver.findElement(
            By.id('sal-salario')
        ).sendKeys('2000');

        await tiraFoto('ETEC1_salario_preenchido');

        await driver.findElement(
            By.css('#panel-salario button.calc')
        ).click();

        await tiraFoto('ETEC1_botao_calcular_clicado');

        await driver.sleep(1500);

        const resultado = await driver.findElement(
            By.id('res-salario')
        ).getText();

        console.log('Resultado encontrado:');
        console.log(resultado);

        await tiraFoto('ETEC1_resultado_exibido');

        if (!resultado.includes('Salário Bruto')) {
            throw new Error('Resultado não exibido');
        }

        console.log('✅ Resultado validado com sucesso');

    } finally {

        if (driver) {
            await driver.quit();
        }

    }
}

main()
    .then(() => console.log('(Time_2) Teste de calculo concluído'))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });