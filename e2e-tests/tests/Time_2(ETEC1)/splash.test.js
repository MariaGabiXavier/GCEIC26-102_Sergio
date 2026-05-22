const { Builder } = require('selenium-webdriver');
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

        opts.addArguments(
            '--headless=new',
            '--no-sandbox',
            '--disable-dev-shm-usage',
            '--window-size=1280,720'
        );

        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(opts)
            .build();

        await driver.manage().setTimeouts({
            implicit: 5000,
            pageLoad: 15000
        });

        const url = `${BASE_URL}/ETEC1/splash`;

        console.log(`Acessando ${url}`);

        await driver.get(url);

        await tiraFoto('ETEC1-splash-01-aberta');

        const current1 = await driver.getCurrentUrl();
        console.log('URL inicial:', current1);

        await driver.sleep(4000);

        await tiraFoto('ETEC1-splash-02-apos-espera');

        const current2 = await driver.getCurrentUrl();
        console.log('URL final:', current2);

        if (!current2.includes('/login')) {
            throw new Error(
                `Esperava redirecionamento para /login, mas foi para ${current2}`
            );
        }

        await tiraFoto('ETEC1-splash-03-redirecionada');

        console.log('✅ Splash redirecionou para Login');

    } finally {

        if (driver) {
            await driver.quit();
        }

    }
}

main()
    .then(() => console.log('(Time_2) Teste de splash concluído'))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });