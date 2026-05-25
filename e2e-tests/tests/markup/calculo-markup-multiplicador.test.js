const { Builder, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const path = require('path');
const { loginMarkup } = require('./loginHelper');

const BASE_URL = process.env.APP_URL || 'http://localhost:3000';

const SCREENSHOTS_DIR = path.join(
    __dirname,
    '..',
    '..',
    'screenshots'
);

if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

let driver;

async function tiraFoto(nome) {
    try {
        // Aguarda estabilização da página para capturar o layout completo
        await driver.sleep(500);
        const img = await driver.takeScreenshot();

        fs.writeFileSync(
            path.join(SCREENSHOTS_DIR, `${nome}.png`),
            img,
            'base64'
        );

        console.log(`📸 Foto tirada: ${nome}.png`);
    } catch (e) {
        console.warn('Erro ao tirar foto:', e.message);
    }
}

async function main() {

    try {

        const opts = new chrome.Options();
        opts.addArguments(
            '--headless=new',
            '--window-size=1920,1080'
        );

        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(opts)
            .build();

        await loginMarkup(driver);

        await driver.get(BASE_URL + '/markup/markup-multiplicador');

        await tiraFoto('Markup-multiplicador-01-aberto');

        await driver.findElement(By.id('dv')).sendKeys('10');
        await driver.findElement(By.id('df')).sendKeys('15');
        await driver.findElement(By.id('ml')).sendKeys('20');

        await tiraFoto('Markup-multiplicador-02-preenchido');

        await driver.findElement(By.id('btnCalcular')).click();

        await driver.sleep(1000);

        await tiraFoto('Markup-multiplicador-03-calculado');

        const resultado = await driver.findElement(
            By.id('resultValue')
        ).getText();

        console.log('Resultado encontrado:', resultado);

        if (!resultado.includes('1.818')) {
            throw new Error(`Resultado inesperado: ${resultado}`);
        }

        await tiraFoto('Markup-multiplicador-04-resultado');

        console.log('✅ Cálculo de markup multiplicador validado com sucesso');

    } finally {

        if (driver) {
            await driver.quit();
        }

    }
}

main()
    .then(() => console.log('(Markup) Teste de cálculo de markup multiplicador concluído'))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });