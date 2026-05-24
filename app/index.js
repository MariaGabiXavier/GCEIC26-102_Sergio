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

// ============================================================
// Markup — Rotas
// ============================================================

function requireMarkupAuth(req, res, next) {
  if (req.session && req.session.markupUser) return next();
  res.redirect("/markup/login");
}

app.get("/markup", (req, res) => {
  res.render("markup/splash", { user: req.session.markupUser || null });
});

app.get("/markup/login", (req, res) => {
  if (req.session.markupUser) return res.redirect("/markup/dashboard");
  res.render("markup/login", { error: null, user: null });
});

app.post("/markup/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.render("markup/login", { error: "Preencha todos os campos", user: null });
  if (username === "admin" && password === "admin") {
    req.session.markupUser = { username: "admin", nome: "Administrador" };
    return res.redirect("/markup/dashboard");
  }
  res.render("markup/login", { error: "Usuário ou senha inválidos", user: null });
});

app.get("/markup/logout", (req, res) => {
  req.session.markupUser = null;
  res.redirect("/markup/login");
});

app.get("/markup/dashboard", requireMarkupAuth, (req, res) => {
  res.render("markup/calculo", { user: req.session.markupUser, tipo: "preco-venda" });
});

app.get("/markup/preco-venda", requireMarkupAuth, (req, res) => {
  res.render("markup/calculo", { user: req.session.markupUser, tipo: "preco-venda" });
});

app.get("/markup/margem-lucro", requireMarkupAuth, (req, res) => {
  res.render("markup/margemLucro", { user: req.session.markupUser, tipo: "margem-lucro" });
});

app.get("/markup/desconto", requireMarkupAuth, (req, res) => {
  res.render("markup/desconto", { user: req.session.markupUser, tipo: "desconto" });
});

app.get("/markup/markup-multiplicador", requireMarkupAuth, (req, res) => {
  res.render("markup/calcularMarkupMultiplicador", { user: req.session.markupUser, tipo: "markup-multiplicador" });
});

app.get("/markup/sobre", requireMarkupAuth, (req, res) => {
  res.render("markup/sobre", { user: req.session.markupUser });
});

app.get("/markup/help", requireMarkupAuth, (req, res) => {
  res.render("markup/help", { user: req.session.markupUser });
});

// Proxy para API /api/markup/calcularPrecoVenda
app.post("/markup/calcularPrecoVenda", requireMarkupAuth, async (req, res) => {
  try {
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(`${API_URL}/api/markup/calcularPrecoVenda`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ success: false, error: err.message });
  }
});

// Proxy para API /api/markup/calcularDesconto
app.post("/markup/calcularDesconto", requireMarkupAuth, async (req, res) => {
  try {
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(`${API_URL}/api/markup/calcularDesconto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ success: false, error: err.message });
  }
});

// Proxy para API /api/markup/calcularMarkupMultiplicador
app.post("/markup/calcularMarkupMultiplicador", requireMarkupAuth, async (req, res) => {
  try {
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(`${API_URL}/api/markup/calcularMarkupMultiplicador`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ============================================================
// EXG — Rotas
// ============================================================

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