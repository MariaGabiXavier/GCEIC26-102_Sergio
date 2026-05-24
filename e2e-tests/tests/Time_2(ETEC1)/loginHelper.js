const { By, until } = require('selenium-webdriver');

/**
 * Realiza o fluxo de login no sistema ETEC1
 * @param {object} driver - Instância do Selenium WebDriver
 */
async function loginETEC1(driver) {
    console.log('🔐 Iniciando fluxo de autenticação...');

    // ✅ CERTO (usando crases ` `)
    await driver.get(`http://localhost:3000/ETEC1/login`);

    // Espera até que o campo de usuário esteja visível (boa prática para evitar erros de carregamento)
    const campoUsuario = await driver.findElement(By.name('usuario'));

    await campoUsuario.sendKeys('admin');
    await driver.findElement(By.name('senha')).sendKeys('1234');

    // Clica no botão de entrar
    await driver.findElement(By.css('form button, form input[type="submit"]')).click();

    // Aguarda o redirecionamento (esperamos que a URL mude para algo que não seja /login)
    await driver.wait(async () => {
        const url = await driver.getCurrentUrl();
        return !url.includes('/login');
    }, 5000, 'Erro: O login demorou muito ou falhou.');

    console.log('✅ Autenticado com sucesso.');
}

module.exports = { loginETEC1 };