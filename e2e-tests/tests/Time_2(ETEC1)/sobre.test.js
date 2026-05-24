const { Builder, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const path = require('path');
const {loginETEC1} = require("./loginHelper");

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

        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(
                new chrome.Options().addArguments('--headless=new')
            )
            .build();

        await loginETEC1(driver);

        await driver.get(
            'http://localhost:3000/ETEC1/sobre'
        );

        await tiraFoto('ETEC1-sobre-01-tela');

        const titulo = await driver.findElement(
            By.tagName('h2')
        ).getText();

        console.log('Título encontrado:', titulo);

        await tiraFoto('ETEC1-sobre-02-titulo');

        if (!titulo.includes('Nossa Equipe')) {
            throw new Error('Tela Sobre incorreta');
        }

        await tiraFoto('ETEC1-sobre-03-validado');

        console.log('✅ Tela Sobre OK');

    } finally {

        if (driver) {
            await driver.quit();
        }

    }
}

main()
    .then(() => console.log('(Time_2) Teste de sobre concluído'))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });