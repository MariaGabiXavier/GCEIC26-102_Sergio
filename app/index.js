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

// Auth middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.user) return next();
  res.redirect("/login");
}

//rota splash screen
app.get('/', (req, res) => {
  res.render('splash', { error: null,
    user: req.session.user || null });
});
app.get('/splash', (req, res) => {
  res.render('splash', { error: null,
    user: req.session.user || null} );
});

//rota sobre
app.get('/sobre', (req, res) => {
  res.render('sobre', { error: null,
    user: req.session.user || null});
});
//rota sobre
app.get('/help', (req, res) => {
  res.render('help', { error: null,
    user: req.session.user || null});
});
app.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/');
  res.render('login', { error: null });
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin') {
    req.session.user = { username: 'admin', nome: 'Administrador' };
    return res.redirect('/');
  }
  res.render("login", { error: "Usuário ou senha inválidos" });
});

// Dashboard (default: preço de venda)
app.get('/calculo', requireAuth, (req, res) => {
  res.render('calculo', { user: req.session.user, tipo: 'preco-venda' });
});

// Rotas para cada tipo de cálculo
app.get('/preco-venda', requireAuth, (req, res) => {
  res.render('calculo', { user: req.session.user, tipo: 'preco-venda' });
});

app.get('/margem-lucro', requireAuth, (req, res) => {
  res.render('margemLucro', { user: req.session.user, tipo: 'margem-lucro' });
});

app.get('/desconto', requireAuth, (req, res) => {
  res.render('desconto', { user: req.session.user, tipo: 'desconto' });
});

app.get('/markup-multiplicador', requireAuth, (req, res) => {
  res.render('calcularMarkupMultiplicador', { user: req.session.user, tipo: 'markup-multiplicador' });
});

// Proxy para API /api/calcularPrecoVenda
app.post('/calcularPrecoVenda', requireAuth, async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`${API_URL}/api/calcularPrecoVenda`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.log(err.message)
    res.status(400).json({ success: false, error: err.message});  
  }
});

// Proxy para API /api/calcularDesconto
app.post('/calcularDesconto', requireAuth, async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`${API_URL}/api/calcularDesconto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.log(err.message)
    res.status(400).json({ success: false, error: err.message});  
  }
});

// Proxy para API /api/calcularMarkupMultiplicador
app.post('/calcularMarkupMultiplicador', requireAuth, async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`${API_URL}/api/calcularMarkupMultiplicador`, {
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

// Rota CD - serve o React compilado
app.get("/cdd", (req, res) => {
  res.sendFile(path.join(__dirname, "views/cdd/index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ App rodando em: http://localhost:${PORT}`);
});
module.exports = app;
