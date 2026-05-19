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
  res.render('login', { error: null });
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
    res.status(400).json({ success: false, error: err.message});  
  }
});

// -- Time_2 ETEC1 --
app.get('/ETEC1/splash',  (req, res) => res.render('Time_2(ETEC1)/splash'));
app.get('/ETEC1/login',   (req, res) => res.render('Time_2(ETEC1)/login', { erro: null }));
app.post('/ETEC1/login',  (req, res) => {
  const { usuario, senha } = req.body;
  if (usuario === 'admin' && senha === '1234') return res.redirect('/ETEC1/calculo');
  res.render('Time_2(ETEC1)/login', { erro: 'Usuário ou senha inválidos.' });
});
app.get('/ETEC1/calculo', (req, res) => res.render('Time_2(ETEC1)/calculo'));
app.get('/ETEC1/sobre',   (req, res) => res.render('Time_2(ETEC1)/sobre'));
app.get('/ETEC1/help',    (req, res) => res.render('Time_2(ETEC1)/help'));
app.get('/ETEC1/logout',  (req, res) => res.redirect('/ETEC1/login'));
app.post('/ETEC1/:rota', async (req, res) => {
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
    res.status(400).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ App Doméstica rodando: http://localhost:${PORT}`);
});
module.exports = app;