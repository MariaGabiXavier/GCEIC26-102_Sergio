const { Builder, By } = require('selenium-webdriver');
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

        await tiraFoto('Markup-login-invalido-01-tela');

        await driver.findElement(By.id('username'))
            .sendKeys('usuarioInvalido');

        await driver.findElement(By.id('password'))
            .sendKeys('senhaErrada');

        await tiraFoto('Markup-login-invalido-02-preenchido');

        await driver.findElement(By.id('loginForm'))
            .submit();

        await driver.sleep(1000);

        await tiraFoto('Markup-login-invalido-03-submit');

        const erro = await driver.findElement(By.className('erro'))
            .getText();

        console.log('Mensagem:', erro);

        await tiraFoto('Markup-login-invalido-04-erro');

        if (!erro || erro.trim().length === 0) {
            throw new Error('Mensagem de erro não encontrada');
        }

        console.log('✅ Login inválido validado');

    } finally {

        if (driver) {
            await driver.quit();
        }

    }
}

main()
    .then(() => console.log('(Markup) Teste de login inválido concluído'))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });