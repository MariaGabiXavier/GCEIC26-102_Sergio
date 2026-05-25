const {
    BASE_URL,
    buildDriver,
    screenshot,
    By,
    until,
    click,
    type
} = require('./helpers');

async function waitError(driver, timeout = 5000) {
    const el = await driver.wait(
        until.elementLocated(By.css('.error')),
        timeout
    );

    await driver.wait(
        until.elementIsVisible(el),
        timeout
    );

    return await el.getText();
}

async function waitAndType(driver, selector, text, timeout = 15000) {
    const el = await driver.wait(
        until.elementLocated(By.css(selector)),
        timeout
    );

    await driver.wait(
        until.elementIsVisible(el),
        timeout
    );

    await el.clear();
    await el.sendKeys(text);
}

async function openLogin(driver) {
    await driver.get(BASE_URL + '/financecar/login');

    await driver.wait(
        until.urlContains('/login'),
        10000
    );

    await driver.sleep(2000);

    await screenshot(driver, 'login-pagina-debug');
}

async function submitForm(driver) {
    const form = await driver.wait(
        until.elementLocated(By.css('[data-testid="login-form"]')),
        15000
    );

    const btn = await driver.wait(
        until.elementLocated(By.css('[data-testid="login-button"]')),
        15000
    );

    await btn.click();
}

async function main() {

    let driver;

    try {

        driver = await buildDriver();

        await driver.manage().window().setRect({
            width: 1400,
            height: 900
        });

        // ======================================
        // CASO 1: CAMPOS VAZIOS
        // ======================================
        await openLogin(driver);

        await submitForm(driver);

        const erroVazio = await waitError(driver);

        await screenshot(driver, 'login-campos-vazios');

        if (!erroVazio.toLowerCase().includes('preencha')) {
            throw new Error(`Esperava mensagem de preenchimento, recebeu: ${erroVazio}`);
        }

        console.log(`✓ Login: campos vazios → "${erroVazio}"`);

        // ======================================
        // CASO 2: UMA CREDENCIAL ERRADA
        // ======================================
        await openLogin(driver);

        await waitAndType(driver, '[data-testid="email-input"]', 'adm');
        await waitAndType(driver, '[data-testid="password-input"]', 'senha_errada');

        await submitForm(driver);

        const erroCredencial = await waitError(driver);

        await screenshot(driver, 'login-uma-credencial-errada');

        if (
            !erroCredencial.toLowerCase().includes('usuário') &&
            !erroCredencial.toLowerCase().includes('senha') &&
            !erroCredencial.toLowerCase().includes('inválid')
        ) {
            throw new Error(
                `Esperava erro de credenciais inválidas, recebeu: ${erroCredencial}`
            );
        }

        console.log(
            `✓ Login: uma credencial errada → "${erroCredencial}"`
        );

        // ======================================
        // CASO 3: CREDENCIAIS INCORRETAS
        // ======================================
        await openLogin(driver);

        await waitAndType(driver, 'input[type="text"]', 'teste');
        await waitAndType(driver, 'input[type="password"]', 'senha_errada');

        await submitForm(driver);

        const erroCredenciais = await waitError(driver);

        await screenshot(driver, 'login-credenciais-invalidas');

        if (
            !erroCredenciais.toLowerCase().includes('usuário') &&
            !erroCredenciais.toLowerCase().includes('senha') &&
            !erroCredenciais.toLowerCase().includes('inválid')
        ) {
            throw new Error(
                `Esperava erro de credenciais, recebeu: ${erroCredenciais}`
            );
        }

        console.log(
            `✓ Login: credenciais inválidas → "${erroCredenciais}"`
        );

        // ======================================
        // CASO 4: LOGIN VÁLIDO
        // ======================================
        await openLogin(driver);

        await waitAndType(driver, 'input[type="text"]', 'adm');
        await waitAndType(driver, 'input[type="password"]', 'adm');

        await submitForm(driver);

        await driver.wait(
            until.urlContains('/home'),
            15000
        );

        await screenshot(driver, 'login-sucesso');

        const urlFinal = await driver.getCurrentUrl();

        if (!urlFinal.includes('/home')) {
            throw new Error(`Esperava /home, recebeu: ${urlFinal}`);
        }

        console.log('✓ Login: login realizado com sucesso');

    } catch (err) {

        console.error('Erro fatal login', err);

        if (driver) {
            console.log(await driver.getCurrentUrl());
        }

        throw err;

    } finally {

        if (driver) {
            await driver.quit();
        }
    }
}

main();