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
            '--no-sandbox',
            '--disable-dev-shm-usage',
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

        const url = `${BASE_URL}/markup`;

        console.log(`Acessando ${url}`);

        await driver.get(url);

        await tiraFoto('Markup-splash-01-aberta');

        const body = await driver.findElement(By.css('body'));
        const bodyText = await body.getText();

        if (!bodyText.includes('Sistema inteligente para cálculo de preço')) {
            throw new Error('Texto esperado não encontrado na splash');
        }

        await tiraFoto('Markup-splash-02-conteudo');

        console.log('✅ Splash screen exibida com sucesso');

    } finally {

        if (driver) {
            await driver.quit();
        }

    }
}

main()
    .then(() => console.log('(Markup) Teste de splash concluído'))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });