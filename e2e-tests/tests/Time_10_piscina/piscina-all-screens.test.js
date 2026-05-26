const { Builder, By } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const fs = require("fs");
const path = require("path");

const BASE_URL = process.env.APP_URL || "http://localhost:3000";

const SCREENSHOTS_DIR = path.join(
  __dirname,
  "..",
  "..",
  "screenshots"
);

// ===============================
// CRIAR PASTA SCREENSHOTS
// ===============================
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, {
    recursive: true,
  });
}

let driver;

const erros = [];

// ===============================
// SCREENSHOT
// ===============================
async function foto(nome) {
  try {
    const img = await driver.takeScreenshot();

    fs.writeFileSync(
      path.join(
        SCREENSHOTS_DIR,
        `PISCINA-${nome}.png`
      ),
      img,
      "base64"
    );

    console.log(`Foto: PISCINA-${nome}.png`);
  } catch (e) {
    console.warn(`Erro ao salvar ${nome}.png`);
  }
}

// ===============================
// LOGS
// ===============================
function ok(msg) {
  console.log(`OK ${msg}`);
}

function fail(msg) {
  console.error(`ERRO ${msg}`);
  erros.push(msg);
}

// ===============================
// AUTENTICAÇÃO
// ===============================
async function autenticarPiscina() {
  await driver.get(BASE_URL + "/piscina/login");

  await driver.sleep(1000);

  const usuario = await driver.findElement(
    By.name("username")
  );

  await usuario.clear();
  await usuario.sendKeys("admin");

  const senha = await driver.findElement(
    By.name("password")
  );

  await senha.clear();
  await senha.sendKeys("admin");

  await driver.findElement(
    By.css('button[type="submit"]')
  ).click();

  await driver.sleep(3000);
}

// ===============================
// TESTE LOGIN
// ===============================
async function testeLogin() {
  console.log("\n[PISCINA 1/5] Login");

  try {
    // ===============================
    // TELA LOGIN
    // ===============================
    await driver.get(BASE_URL + "/piscina/login");

    await driver.sleep(1000);

    await foto("01-login");

    // ===============================
    // CAMPOS VAZIOS
    // ===============================
    await driver.findElement(
      By.css('button[type="submit"]')
    ).click();

    await driver.sleep(1500);

    await foto("02-login-vazio");

    const urlVazia = await driver.getCurrentUrl();

    urlVazia.includes("/login")
      ? ok("Campos vazios permanecem no login")
      : fail("Login vazio mudou de tela");

    // ===============================
    // LOGIN INVÁLIDO
    // ===============================
    await driver.get(BASE_URL + "/piscina/login");

    await driver.sleep(1000);

    await driver.findElement(
      By.name("username")
    ).sendKeys("errado");

    await driver.findElement(
      By.name("password")
    ).sendKeys("errado");

    await driver.findElement(
      By.css('button[type="submit"]')
    ).click();

    await driver.sleep(2000);

    await foto("03-login-invalido");

    const bodyErro = await driver.findElement(
      By.tagName("body")
    ).getText();

    bodyErro.toLowerCase().includes("inválido") ||
    bodyErro.toLowerCase().includes("invalid")
      ? ok("Login inválido bloqueado")
      : fail("Mensagem de erro não encontrada");

    // ===============================
    // LOGIN CORRETO
    // ===============================
    await driver.get(BASE_URL + "/piscina/login");

    await driver.sleep(1000);

    const usuario = await driver.findElement(
      By.name("username")
    );

    await usuario.clear();

    await usuario.sendKeys("admin");

    const senha = await driver.findElement(
      By.name("password")
    );

    await senha.clear();

    await senha.sendKeys("admin");

    await foto("04-login-preenchido");

    await driver.findElement(
      By.css('button[type="submit"]')
    ).click();

    await driver.sleep(4000);

    await foto("05-login-sucesso");

    ok("Login realizado");
  } catch (e) {
    fail(`Login: ${e.message}`);
  }
}

// ===============================
// TESTE CALCULADORA
// ===============================
async function testeCalculadora() {
  console.log("\n[PISCINA 2/5] Calculadora");

  try {
    await autenticarPiscina();

    await driver.get(BASE_URL + "/piscina/calculo");

    await driver.sleep(3000);

    await foto("06-tela-calculo");

    const comprimento = await driver.findElement(
      By.name("comprimento")
    );

    const largura = await driver.findElement(
      By.name("largura")
    );

    const profundidade = await driver.findElement(
      By.name("profundidade")
    );

    await comprimento.clear();
    await largura.clear();
    await profundidade.clear();

    await comprimento.sendKeys("5");
    await largura.sendKeys("3");
    await profundidade.sendKeys("1.5");

    await foto("07-formulario-preenchido");

    const botoes = await driver.findElements(
      By.tagName("button")
    );

    await botoes[botoes.length - 1].click();

    await driver.sleep(5000);

    await foto("08-resultado");

    const bodyResultado = await driver.findElement(
      By.tagName("body")
    ).getText();

    bodyResultado.toLowerCase().includes("resultado")
      ? ok("Resultado exibido")
      : fail("Resultado não apareceu");
  } catch (e) {
    fail(`Calculadora: ${e.message}`);
  }
}

// ===============================
// TESTE HELP
// ===============================
async function testeHelp() {
  console.log("\n[PISCINA 3/5] Help");

  try {
    await autenticarPiscina();

    await driver.get(BASE_URL + "/piscina/help");

    await driver.sleep(2000);

    await foto("09-help");

    const body = await driver.findElement(
      By.tagName("body")
    ).getText();

    body.length > 0
      ? ok("Tela help carregada")
      : fail("Tela help vazia");
  } catch (e) {
    fail(`Help: ${e.message}`);
  }
}

// ===============================
// TESTE SOBRE
// ===============================
async function testeSobre() {
  console.log("\n[PISCINA 4/5] Sobre");

  try {
    await autenticarPiscina();

    await driver.get(BASE_URL + "/piscina/sobre");

    await driver.sleep(2000);

    await foto("10-sobre");

    const body = await driver.findElement(
      By.tagName("body")
    ).getText();

    body.length > 0
      ? ok("Tela sobre carregada")
      : fail("Tela sobre vazia");
  } catch (e) {
    fail(`Sobre: ${e.message}`);
  }
}


// ===============================
// MAIN
// ===============================
async function main() {
  try {
    const opts = new chrome.Options();

    opts.addArguments(
      "--headless=new",
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--window-size=1280,800",
      "--disable-gpu"
    );

    driver = await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(opts)
      .build();

    await driver.manage().setTimeouts({
      implicit: 5000,
      pageLoad: 15000,
    });

    await testeLogin();

    await testeCalculadora();

    await testeHelp();

    await testeSobre();

  } finally {
    if (driver) {
      await driver.quit();
    }
  }

  // ===============================
  // RESULTADO FINAL
  // ===============================
  if (erros.length > 0) {
    console.error("\nErros encontrados:\n");

    erros.forEach((erro) => {
      console.error(` - ${erro}`);
    });

    process.exit(1);
  }

  console.log(
    "\nTodos os testes da Piscina passaram!"
  );
}

module.exports = main;