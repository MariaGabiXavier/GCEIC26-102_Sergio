const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const path = require('path');

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

        await driver.manage().setTimeouts({
            implicit: 5000,
            pageLoad: 15000
        });

        await driver.get(BASE_URL + '/markup/preco-venda');

        await tiraFoto('Markup-protected-01-acessando');

        await driver.wait(until.urlContains('/markup/login'), 5000);

        await tiraFoto('Markup-protected-02-redirecionado');

        console.log('✅ Rota protegida redirecionou para login');

    } finally {

        if (driver) {
            await driver.quit();
        }

    }
}

main()
    .then(() => console.log('(Markup) Teste de rota protegida concluído'))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });