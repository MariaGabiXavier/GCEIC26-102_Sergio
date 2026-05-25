const {
  BASE_URL,
  buildDriver,
  screenshot,
  click,
  type,
  By,
  until,
  openHelpAndValidate
} = require("./helpers");

const APP_BASE =
  BASE_URL + "/financecar";

let driver;
const erros = [];

// ======================================
// HELPERS
// ======================================
async function esperarPagina() {

  await driver.wait(
    async () => {

      const state =
        await driver.executeScript(
          "return document.readyState"
        );

      return state === "complete";

    },
    15000
  );
}

async function waitError(
  timeout = 10000
) {

  const el = await driver.wait(
    until.elementLocated(
      By.css(".error, #errorMsg")
    ),
    timeout
  );

  await driver.wait(
    until.elementIsVisible(el),
    timeout
  );

  return await el.getText();
}

async function waitAndType(
  selector,
  text,
  timeout = 15000
) {

  const el = await driver.wait(
    until.elementLocated(
      By.css(selector)
    ),
    timeout
  );

  await driver.wait(
    until.elementIsVisible(el),
    timeout
  );

  await el.clear();

  await el.sendKeys(text);
}

async function autenticar() {

  await driver.get(
    APP_BASE + "/login"
  );

  await esperarPagina();

  // tenta vários seletores possíveis
  const email =
    await driver.wait(
      until.elementLocated(
        By.css(
          '#email, [data-testid="email-input"], input[type="text"]'
        )
      ),
      15000
    );

  await email.clear();
  await email.sendKeys("adm");

  const senha =
    await driver.findElement(
      By.css(
        '#password, [data-testid="password-input"], input[type="password"]'
      )
    );

  await senha.clear();
  await senha.sendKeys("adm");

  const botao =
    await driver.findElement(
      By.css(
        'button, [data-testid="login-button"]'
      )
    );

  await botao.click();

  await driver.wait(
    until.urlContains("/home"),
    15000
  );

  console.log(
    "✓ Usuário autenticado"
  );
}

// ======================================
// TESTE SPLASH
// ======================================
async function testeSplash() {

  console.log("\n[1/6] Splash");

  await driver.get(APP_BASE);

  // splash aparece
  await driver.wait(
    until.elementLocated(
      By.css(".logo-splash")
    ),
    5000
  );

  console.log(
    "✓ Splash apareceu"
  );

  await screenshot(
    driver,
    "01-splash"
  );

  // espera login carregar
  await driver.wait(
    until.urlContains(
      "/financecar/login"
    ),
    15000
  );

  await driver.wait(
    until.elementLocated(
      By.css(
        '#email, [data-testid="email-input"], input[type="password"]'
      )
    ),
    15000
  );

  console.log(
    "✓ Splash finalizada"
  );

  await screenshot(
    driver,
    "01-login"
  );
}

// ======================================
// TESTE LOGIN
// ======================================
async function testeLogin() {

  console.log("\n[2/6] Login");

  // ======================================
  // LOGIN INVÁLIDO
  // ======================================
  await driver.get(
    APP_BASE + "/login"
  );

  await esperarPagina();

  await waitAndType(
    '#email, [data-testid="email-input"], input[type="text"]',
    "errado"
  );

  await waitAndType(
    '#password, [data-testid="password-input"], input[type="password"]',
    "errado"
  );

  const btnErro =
    await driver.findElement(
      By.css(
        'button, [data-testid="login-button"]'
      )
    );

  await btnErro.click();

  const erro =
    await waitError();

  await screenshot(
    driver,
    "02-login-erro"
  );

  console.log(
    `✓ Login inválido → "${erro}"`
  );

  // ======================================
  // LOGIN VÁLIDO
  // ======================================
  await autenticar();

  await screenshot(
    driver,
    "02-login-sucesso"
  );

  console.log(
    "✓ Login realizado"
  );
}

// ======================================
// TESTE ROTAS
// ======================================
async function testeRotas() {

  console.log(
    "\n[3/6] Rotas protegidas"
  );

  const rotas = [
    "/financecar",
    "/financecar/juros",
    "/financecar/financiamento",
    "/financecar/fundo",
    "/financecar/regra",
    "/financecar/sobre"
  ];

  for (const rota of rotas) {

    await driver.executeScript(`
      localStorage.clear();
      sessionStorage.clear();
    `);

    await driver.manage()
      .deleteAllCookies();

    await driver.get(
      BASE_URL + rota
    );

    await driver.wait(
      until.urlContains(
        "/financecar/login"
      ),
      15000
    );

    console.log(
      `✓ Rota protegida → ${rota}`
    );
  }
}

// ======================================
// TESTE TELAS
// ======================================
async function testeTelas() {

  console.log("\n[4/6] Telas");

  await autenticar();

  const telas = [
    "juros",
    "financiamento",
    "fundo",
    "regra"
  ];

  for (const rota of telas) {

    console.log(
      `\n→ Abrindo ${rota}`
    );

    await driver.get(
      APP_BASE + "/" + rota
    );

    await esperarPagina();

    await driver.wait(
      until.elementLocated(
        By.css(
          "body"
        )
      ),
      10000
    );

    const elementos =
      await driver.findElements(
        By.css(
          "form, .container, .card, h1, h2"
        )
      );

    if (elementos.length === 0) {

      erros.push(
        `Tela ${rota} sem conteúdo`
      );

      continue;
    }

    await screenshot(
      driver,
      `04-${rota}`
    );

    console.log(
      `✓ Tela ${rota} carregada`
    );
  }
}

// ======================================
// TESTE SOBRE
// ======================================
async function testeSobre() {

  console.log("\n[5/6] Sobre");

  await driver.get(APP_BASE + "/sobre");

  // espera a tela carregar
  await driver.wait(
      until.elementLocated(By.css(".hero-sobre")),
      15000
  );

  // valida título
  const titulo = await driver.findElement(
      By.css(".hero-sobre h1")
  ).getText();

  if (!titulo.includes("Equipe FinanceCar")) {
      throw new Error("Título da página Sobre não encontrado");
  }

  await screenshot(driver, "05-sobre.png");

  console.log("✓ Tela sobre carregada");
}

// ======================================
// TESTE HELPERS
// ======================================
async function testeHelps() {

  console.log("\n[6/6] Helps");

  await autenticar();

  const telas = [
    "juros",
    "financiamento",
    "fundo",
    "regra"
  ];

  for (const tela of telas) {

    await driver.get(
      APP_BASE + "/financecar/" + tela
    );

    await esperarPagina();

    await driver.wait(
      until.elementLocated(
        By.css(".help-btn")
      ),
      10000
    );

    await screenshot(
      driver,
      `help-${tela}`
    );

    await openHelpAndValidate(
      driver,
      tela
    );

    console.log(
      `✓ Help ${tela} validado`
    );
  }
}

// ======================================
// MAIN
// ======================================
async function main() {

  driver = await buildDriver();

  await driver.manage()
    .window()
    .setRect({
      width: 1400,
      height: 900
    });

  try {

    await testeSplash();

    await testeLogin();

    await testeRotas();

    await testeTelas();

    await testeSobre();

    await testeHelps();

  } catch (err) {

    console.error(
      "❌ Erro fatal:",
      err
    );

    process.exit(1);

  } finally {

    if (driver) {

      await driver.quit();
    }
  }

  console.log(
    "\n────────────────────────────"
  );

  if (erros.length === 0) {

    console.log(
      "✅ Tudo passou!"
    );

  } else {

    console.log(
      `❌ ${erros.length} falhas`
    );

    erros.forEach(e =>
      console.log(" • " + e)
    );

    process.exit(1);
  }
}

module.exports = main;

if (require.main === module) {
  main();
}