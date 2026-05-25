const { Builder, By, until } = require('selenium-webdriver');
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

        await tiraFoto('Markup-logout-01-logado');

        await driver.get(BASE_URL + '/markup/logout');

        await driver.wait(until.urlContains('/markup/login'), 5000);

        await tiraFoto('Markup-logout-02-redirecionado');

        const urlFinal = await driver.getCurrentUrl();
        console.log('URL após logout:', urlFinal);

        if (!urlFinal.includes('/markup/login')) {
            throw new Error(`Esperava /markup/login, mas foi para ${urlFinal}`);
        }

        console.log('✅ Logout realizado com sucesso');

    } finally {

        if (driver) {
            await driver.quit();
        }

    }
}

main()
    .then(() => console.log('(Markup) Teste de logout concluído'))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });