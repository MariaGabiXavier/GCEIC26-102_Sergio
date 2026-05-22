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

        await driver.get(
            'http://localhost:3000/ETEC1/help'
        );

        await tiraFoto('ETEC1_tela_ajuda_aberta');

        const titulo = await driver.findElement(
            By.tagName('h2')
        ).getText();

        console.log('Título encontrado:', titulo);

        await tiraFoto('ETEC1_titulo_verificado');

        if (!titulo.includes('Como usar')) {
            throw new Error('Tela de ajuda incorreta');
        }

        console.log('✅ Tela ajuda OK');

    } finally {

        if (driver) {
            await driver.quit();
        }

    }
}

main()
    .then(() => console.log('(Time_2) Teste de ajuda concluído'))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });