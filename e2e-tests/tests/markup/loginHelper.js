const { By, until } = require('selenium-webdriver');

/**
 * Realiza o fluxo de login no sistema Markup
 * @param {object} driver - Instância do Selenium WebDriver
 * @param {string} username - Nome de usuário (default: 'admin')
 * @param {string} password - Senha (default: 'admin')
 */
async function loginMarkup(driver, username = 'admin', password = 'admin') {
    console.log('🔐 Iniciando fluxo de autenticação...');

    await driver.get('http://localhost:3000/markup/login');

    await driver.findElement(By.id('username')).sendKeys(username);
    await driver.findElement(By.id('password')).sendKeys(password);

    await driver.findElement(By.id('loginForm')).submit();

    // Aguarda o redirecionamento (esperamos que a URL mude para algo que não seja /login)
    await driver.wait(async () => {
        const url = await driver.getCurrentUrl();
        return !url.includes('/login');
    }, 5000, 'Erro: O login demorou muito ou falhou.');

    console.log('✅ Autenticado com sucesso.');
}

module.exports = { loginMarkup };