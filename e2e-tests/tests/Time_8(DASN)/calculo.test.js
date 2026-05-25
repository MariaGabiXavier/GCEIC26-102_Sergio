const { Builder, By, until } = require('selenium-webdriver');

(async function testDASN() {
    let driver = await new Builder().forBrowser('chrome').build();
    try {
        await driver.get('http://localhost:3000/DASN/login');

        await driver.findElement(By.name('usuario')).sendKeys('admin');
        await driver.findElement(By.name('senha')).sendKeys('1234');
        await driver.findElement(By.css('button[type="submit"]')).click();

        await driver.wait(until.urlContains('/DASN/calculo'), 5000);

        await driver.findElement(By.id('comercio')).sendKeys('40000');
        await driver.findElement(By.id('servicos')).sendKeys('20000');
        await driver.findElement(By.id('meses')).sendKeys('12');
        await driver.findElement(By.css('#limiteForm button[type="submit"]')).click();

        let resultadoDiv = await driver.findElement(By.id('resultadoLimite'));
        
        await driver.wait(until.elementTextContains(resultadoDiv, '60000.00'), 5000);
        
        let resultadoText = await resultadoDiv.getText();

        if (resultadoText.includes('60000.00') && resultadoText.includes('Não')) {
            console.log(' Teste E2E DASN-SIMEI: PASSOU');
        } else {
            console.log(' Teste E2E DASN-SIMEI: FALHOU');
        }
    } catch (err) {
        console.error('Erro no teste:', err);
    } finally {
        await driver.quit();
    }
})();