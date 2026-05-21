console.log("Iniciando...");
console.log("Deu certo");

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const API_URL = process.env.API_URL || 'http://localhost:3001';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: 'domestic-worker-secret-2025',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3600000 },
}));

// Auth middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.user) return next();
  res.redirect('/login');
}

app.get('/', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.render('inicial', { error: null });
});

app.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.render('login', { error: null });
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});


app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin') {
    req.session.user = { username: 'admin', nome: 'Administrador' };
    return res.redirect('/calculo');
  }
  res.render('login', { error: 'Usuário ou senha inválidos' });
});

// Dashboard
app.get('/calculo', requireAuth, (req, res) => {
  res.render('calculo', { user: req.session.user });
});

// Calcular encargos (proxy para API)
app.post('/calcular', requireAuth, async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    console.log("passou 1");
    const response = await fetch(`${API_URL}/api/calcular`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    console.log("passou 1a");
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.log(err.message)
    res.status(400).json({ success: false, error: err.message });
  }
});

// Rotas EXG (equipe)

function requireExgAuth(req, res, next) {
  if (req.session && req.session.exgUser) return next();
  res.redirect('/exg/login');
}

app.get('/exg', (req, res) => {
  res.render('exg/splash');
});

app.get('/exg/login', (req, res) => {
  if (req.session.exgUser) return res.redirect('/exg/dashboard');
  res.render('exg/login', { error: null });
});

app.post('/exg/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.render('exg/login', { error: 'Preencha todos os campos' });
  if (username === 'adm' && password === 'adm') {
    req.session.exgUser = { username: 'adm', nome: 'Administrador' };
    return res.redirect('/exg/dashboard');
  }
  res.render('exg/login', { error: 'Usuário ou senha invalidos' });
});

app.get('/exg/logout', (req, res) => {
  req.session.exgUser = null;
  res.redirect('/exg/login');
});

app.get('/exg/dashboard', requireExgAuth, async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`${API_URL}/api/exg/listCurrency`);
    const currencies = await response.json();
    res.render('exg/dashboard', { user: req.session.exgUser, currencies });
  } catch (err) {
    res.render('exg/dashboard', { user: req.session.exgUser, currencies: [] });
  }
});

app.get('/exg/exchange', requireExgAuth, async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`${API_URL}/api/exg/listCurrency`);
    const currencies = await response.json();
    res.render('exg/exchange', { user: req.session.exgUser, currencies, preselected: req.query.currency || '' });
  } catch (err) {
    res.render('exg/exchange', { user: req.session.exgUser, currencies: [], preselected: req.query.currency || '' });
  }
});

app.post('/exg/exchange', requireExgAuth, async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const payload = { ...req.body, token: 'token-simulado-123', value: parseFloat(req.body.value) };
    const response = await fetch(`${API_URL}/api/exg/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.get('/exg/currencies', requireExgAuth, async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`${API_URL}/api/exg/listCurrency`);
    const currencies = await response.json();
    res.json(currencies);
  } catch (err) {
    res.status(503).json([]);
  }
});

app.get('/exg/about', requireExgAuth, (req, res) => {
  res.render('exg/about', { user: req.session.exgUser });
});

app.get('/exg/help', requireExgAuth, (req, res) => {
  res.render('exg/help', { user: req.session.exgUser });
});

app.listen(PORT, () => {
  console.log(`✅ App Doméstica rodando: http://localhost:${PORT}`);
});
module.exports = app;