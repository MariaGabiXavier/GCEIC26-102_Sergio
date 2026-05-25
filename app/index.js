console.log("Iniciando...");
console.log("Deu certo");

const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const API_URL = process.env.API_URL || "http://localhost:3001";

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/cdd", express.static(path.join(__dirname, "views/cdd")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "domestic-worker-secret-2025",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 },
  }),
);



const equipes = [
  { numero: 1, nome: 'ETEC1', rota: '/ETEC1/splash' },
  { numero: 2, nome: 'EXCHANGE', rota: '/exg' },
  { numero: 3, nome: 'CDD', rota: '/cdd' },
  { numero: 4, nome: 'CLT', rota: '/clt' },
  { numero: 5, nome: 'Equipe-5', rota: '/equipe-5' },
  { numero: 6, nome: 'Equipe-6', rota: '/equipe-6' },
  { numero: 7, nome: 'Equipe-7', rota: '/equipe-7' },
  { numero: 8, nome: 'DASN-SIMEI', rota: '/DASN' },
  { numero: 9, nome: 'Equipe-9', rota: '/equipe-9' },
  { numero: 10, nome: 'Equipe-10', rota: '/equipe-10' },
  { numero: 11, nome: 'Equipe-11', rota: '/equipe-11' },
  { numero: 12, nome: 'Equipe-12', rota: '/equipe-12' },
  { numero: 13, nome: 'Equipe-13', rota: '/equipe-13' },
  { numero: 14, nome: 'Equipe-14', rota: '/equipe-14' },
  { numero: 15, nome: 'Equipe-15', rota: '/equipe-15' },
  { numero: 16, nome: 'Equipe-16', rota: '/equipe-16' },
  { numero: 17, nome: 'Equipe-17', rota: '/equipe-17' },
  { numero: 18, nome: 'Equipe-18', rota: '/equipe-18' },
  { numero: 19, nome: 'Equipe-19', rota: '/equipe-19' },
  { numero: 20, nome: 'Equipe-20', rota: '/equipe-20' }
]

// Auth middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.user) return next();
  res.redirect("/login");
}

app.get("/", (req, res) => {
  res.render('index', { equipes });
  //if (req.session.user) return res.redirect("/dashboard");
  //res.render("inicial", { error: null });
});

app.get("/login", (req, res) => {
  if (req.session.user) return res.redirect("/dashboard");
  res.render("login", { error: null });
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "admin") {
    req.session.user = { username: "admin", nome: "Administrador" };
    return res.redirect("/calculo");
  }
  res.render("login", { error: "Usuário ou senha inválidos" });
});

// Dashboard
app.get("/calculo", requireAuth, (req, res) => {
  res.render("calculo", { user: req.session.user });
});

// Calcular encargos (proxy para API)
app.post("/calcular", requireAuth, async (req, res) => {
  try {
    const fetch = (await import("node-fetch")).default;
    console.log("passou 1");
    const response = await fetch(`${API_URL}/api/calcular`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    console.log("passou 1a");
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ success: false, error: err.message });
  }
});

// -- Time_2 ETEC1 --
function requireAuthETEC1(req, res, next) {
  if (req.session && req.session.user) {return next();}
  res.redirect('/ETEC1/login');
}

app.get('/ETEC1/splash', (req, res) => res.render('Time_2(ETEC1)/splash'));
app.get('/ETEC1/login', (req, res) => res.render('Time_2(ETEC1)/login', { erro: null }));
app.post('/ETEC1/login', (req, res) => {
  const { usuario, senha } = req.body;
  if (usuario === 'admin' && senha === '1234') {
    req.session.user = { username: usuario };
    return res.redirect('/ETEC1/calculo');
  }
  res.render('Time_2(ETEC1)/login', {erro: 'Usuário ou senha inválidos.'});
});
app.get('/ETEC1/calculo', requireAuthETEC1, (req, res) => res.render('Time_2(ETEC1)/calculo'));
app.get('/ETEC1/sobre', requireAuthETEC1, (req, res) => res.render('Time_2(ETEC1)/sobre'));
app.get('/ETEC1/help', requireAuthETEC1, (req, res) => res.render('Time_2(ETEC1)/help'));
app.get('/ETEC1/logout', (req, res) => { req.session.destroy(() => {res.redirect('/ETEC1/login');});
});
app.post('/ETEC1/:rota', requireAuthETEC1, async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`${API_URL}/ETEC1/${req.params.rota}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(400).json({success: false, error: err.message});
  }
});

// Rotas EXG (equipe)

function requireExgAuth(req, res, next) {
  if (req.session && req.session.exgUser) return next();
  res.redirect("/exg/login");
}

app.get("/exg", (req, res) => {
  res.render("exg/splash");
});

app.get("/exg/login", (req, res) => {
  if (req.session.exgUser) return res.redirect("/exg/dashboard");
  res.render("exg/login", { error: null });
});

app.post("/exg/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.render("exg/login", { error: "Preencha todos os campos" });
  if (username === "adm" && password === "adm") {
    req.session.exgUser = { username: "adm", nome: "Administrador" };
    return res.redirect("/exg/dashboard");
  }
  res.render("exg/login", { error: "Usuário ou senha invalidos" });
});

app.get("/exg/logout", (req, res) => {
  req.session.exgUser = null;
  res.redirect("/exg/login");
});

app.get("/exg/dashboard", requireExgAuth, async (req, res) => {
  try {
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(`${API_URL}/api/exg/listCurrency`);
    const currencies = await response.json();
    res.render("exg/dashboard", { user: req.session.exgUser, currencies });
  } catch (err) {
    res.render("exg/dashboard", { user: req.session.exgUser, currencies: [] });
  }
});

app.get("/exg/exchange", requireExgAuth, async (req, res) => {
  try {
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(`${API_URL}/api/exg/listCurrency`);
    const currencies = await response.json();
    res.render("exg/exchange", {
      user: req.session.exgUser,
      currencies,
      preselected: req.query.currency || "",
    });
  } catch (err) {
    res.render("exg/exchange", {
      user: req.session.exgUser,
      currencies: [],
      preselected: req.query.currency || "",
    });
  }
});

app.post("/exg/exchange", requireExgAuth, async (req, res) => {
  try {
    const fetch = (await import("node-fetch")).default;
    const payload = {
      ...req.body,
      token: "token-simulado-123",
      value: Number.parseFloat(req.body.value),
    };
    const response = await fetch(`${API_URL}/api/exg/exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.get("/exg/currencies", requireExgAuth, async (req, res) => {
  try {
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(`${API_URL}/api/exg/listCurrency`);
    const currencies = await response.json();
    res.json(currencies);
  } catch (err) {
    res.status(503).json([]);
  }
});

app.get("/exg/about", requireExgAuth, (req, res) => {
  res.render("exg/about", { user: req.session.exgUser });
});

app.get("/exg/help", requireExgAuth, (req, res) => {
  res.render("exg/help", { user: req.session.exgUser });
});


// ROTAS FINANCECAR (Time 6)
function requireFinanceAuth(req, res, next) {
  if (req.session && req.session.financeUser) return next();

  res.redirect("/financecar/login");
}

// SPLASH
app.get("/financecar", (req, res) => {
  res.render("financecar/splash");
});

// LOGIN
app.get("/financecar/login", (req, res) => {
  if (req.session.financeUser) {
    return res.redirect("/financecar/home");
  }

  res.render("financecar/login", { error: null });
});

app.post("/financecar/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.render("financecar/login", {
      error: "Preencha todos os campos",
    });
  }

  if (username === "adm" && password === "adm") {
    req.session.financeUser = {
      username: "adm",
      nome: "Administrador",
    };

    return res.redirect("/financecar/home");
  }

  res.render("financecar/login", {
    error: "Usuário ou senha inválidos",
  });
});

// LOGOUT
app.get("/financecar/logout", (req, res) => {
  req.session.destroy((err) => {
    res.clearCookie("connect.sid");
    return res.redirect("/financecar/login");
  });
});

// HOME
app.get("/financecar/home", requireFinanceAuth, (req, res) => {
  res.render("financecar/home", {
    user: req.session.financeUser,
  });
});

// JUROS
app.get("/financecar/juros", requireFinanceAuth, (req, res) => {
  res.render("financecar/juros", {
    user: req.session.financeUser,
  });
});

// FINANCIAMENTO
app.get("/financecar/financiamento", requireFinanceAuth, (req, res) => {
  res.render("financecar/financiamento", {
    user: req.session.financeUser,
  });
});

// FUNDO
app.get("/financecar/fundo", requireFinanceAuth, (req, res) => {
  res.render("financecar/fundo", {
    user: req.session.financeUser,
  });
});

// REGRA
app.get("/financecar/regra", requireFinanceAuth, (req, res) => {
  res.render("financecar/regra", {
    user: req.session.financeUser,
  });
});

// SOBRE
app.get("/financecar/sobre", requireFinanceAuth, (req, res) => {
  res.render("financecar/sobre", {
    user: req.session.financeUser,
  });
});

// API JUROS
app.post("/api/financecar/juros", requireFinanceAuth, async (req, res) => {
  try {
    const fetch = (await import("node-fetch")).default;

    const response = await fetch(`${API_URL}/api/financecar/juros`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    return res.status(response.status).json(data);

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// API FINANCIAMENTO
app.post("/api/financecar/financiamento", requireFinanceAuth, async (req, res) => {
  try {
    const fetch = (await import("node-fetch")).default;

    const response = await fetch(`${API_URL}/api/financecar/financiamento`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    res.json(data);

  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
});

// API FUNDO
app.post("/api/financecar/fundo", requireFinanceAuth, async (req, res) => {
  try {
    const fetch = (await import("node-fetch")).default;

    const response = await fetch(`${API_URL}/api/financecar/fundo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    res.json(data);

  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
});

// API REGRA
app.post("/api/financecar/regra", requireFinanceAuth, async (req, res) => {
  try {
    const fetch = (await import("node-fetch")).default;

    const response = await fetch(`${API_URL}/api/financecar/regra`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    res.json(data);

  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
});

// Rota CD - serve o React compilado
app.get("/cdd", (req, res) => {
  res.sendFile(path.join(__dirname, "views/cdd/index.html"));
});

// Rotas CLT Empresarial

function requireCltAuth(req, res, next) {
  if (req.session && req.session.cltUser) return next();
  res.redirect('/clt/login');
}

app.get('/clt', (_req, res) => {
  res.render('clt/splash');
});

app.get('/clt/login', (req, res) => {
  if (req.session.cltUser) return res.redirect('/clt/dashboard');
  res.render('clt/login', { error: null });
});

app.post('/clt/login', (req, res) => {
  const username = String(req.body.username || '').trim();
  const password = String(req.body.password || '').trim();
  if (!username || !password) {
    return res.render('clt/login', { error: 'Preencha usuário e senha' });
  }
  if (username === 'admin' && password === 'admin') {
    req.session.cltUser = { username: 'admin', nome: 'Administrador' };
    return res.redirect('/clt/dashboard');
  }
  return res.render('clt/login', { error: 'Usuário ou senha inválidos' });
});

app.get('/clt/logout', (req, res) => {
  req.session.cltUser = null;
  res.redirect('/clt/login');
});

app.get('/clt/dashboard', requireCltAuth, (req, res) => {
  res.render('clt/dashboard', { user: req.session.cltUser });
});

app.get('/clt/calculadora', requireCltAuth, (req, res) => {
  res.render('clt/calculadora', { user: req.session.cltUser });
});

app.post('/clt/calcular', requireCltAuth, async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const payload = { ...req.body, token: 'token-clt-empresarial-123' };
    const response = await fetch(`${API_URL}/api/clt/resultado-contratacao`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(400).json({ success: false, erro: err.message });
  }
});

app.get('/clt/about', requireCltAuth, (req, res) => {
  res.render('clt/about', { user: req.session.cltUser });
});

app.get('/clt/help', requireCltAuth, (req, res) => {
  res.render('clt/help', { user: req.session.cltUser });
});


// -- Time_8 DASN-SIMEI --
function requireAuthDASN(req, res, next) {
  if (req.session && req.session.dasnUser) return next();
  res.redirect('/DASN/login');
}

app.get('/DASN', (req, res) => res.render('Time_8(DASN)/splash'));
app.get('/DASN/login', (req, res) => res.render('Time_8(DASN)/login', { erro: null }));
app.post('/DASN/login', (req, res) => {
  const { usuario, senha } = req.body;
  if (usuario === 'admin' && senha === '1234') {
    req.session.dasnUser = { username: usuario };
    return res.redirect('/DASN/calculo');
  }
  res.render('Time_8(DASN)/login', {erro: 'Usuário ou senha inválidos.'});
});
app.get('/DASN/calculo', requireAuthDASN, (req, res) => res.render('Time_8(DASN)/calculo'));
app.get('/DASN/sobre', requireAuthDASN, (req, res) => res.render('Time_8(DASN)/sobre'));
app.get('/DASN/help', requireAuthDASN, (req, res) => res.render('Time_8(DASN)/help'));
app.get('/DASN/logout', (req, res) => { req.session.destroy(() => {res.redirect('/DASN/login');});
});

app.post('/DASN/valida-limite', requireAuthDASN, async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`${API_URL}/DASN/valida-limite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(400).json({success: false, error: err.message});
  }
});


// 20 dynamic team endpoints
for (let i = 5; i <= 20; i++) {
  app.get(`/equipe-${i}`, (req, res) => {
    console.log(`/equipe-${i}/equipe`);
    res.render(`equipe`, {
      numero: i,
      nome: `Equipe-${i}`
    });
  });
}



app.listen(PORT, () => {
  console.log(`✅ App Doméstica rodando: http://localhost:${PORT}`);
});
module.exports = app;
