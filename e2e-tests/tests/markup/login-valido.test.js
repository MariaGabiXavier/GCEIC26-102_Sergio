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

        await driver.get(BASE_URL + '/markup/login');

        await tiraFoto('Markup-login-valido-01-tela');

        await driver.findElement(By.id('username'))
            .sendKeys('admin');

        await driver.findElement(By.id('password'))
            .sendKeys('admin');

        await tiraFoto('Markup-login-valido-02-preenchido');

        await driver.findElement(By.id('loginForm'))
            .submit();

        await tiraFoto('Markup-login-valido-03-submit');

        await driver.wait(
            until.urlContains('/markup/dashboard'),
            5000
        );

        const urlFinal = await driver.getCurrentUrl();
        console.log('URL após login:', urlFinal);

        await tiraFoto('Markup-login-valido-04-logado');

        console.log('✅ Login realizado com sucesso');

    } finally {

        if (driver) {
            await driver.quit();
        }

    }
}

main()
    .then(() => console.log('(Markup) Teste de login válido concluído'))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });