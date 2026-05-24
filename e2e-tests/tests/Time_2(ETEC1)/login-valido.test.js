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
        opts.addArguments('--headless=new');

        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(opts)
            .build();

        await driver.get(BASE_URL + '/ETEC1/login');

        await tiraFoto('ETEC1-login-valido-01-tela');

        await driver.findElement(By.name('usuario'))
            .sendKeys('admin');

        await driver.findElement(By.name('senha'))
            .sendKeys('1234');

        await tiraFoto('ETEC1-login-valido-02-preenchido');

        await driver.findElement(By.css('button[type="submit"]'))
            .click();

        await tiraFoto('ETEC1-login-valido-03-submit');

        await driver.wait(
            until.urlContains('/calculo'),
            5000
        );

        await tiraFoto('ETEC1-login-valido-04-logado');

        console.log('✅ Login realizado com sucesso');

    } finally {

        if (driver) {
            await driver.quit();
        }

    }
}

main()
    .then(() => console.log('(Time_2) Teste de login válido concluído'))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });