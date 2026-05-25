// Minimal client-side JS that reproduces the React app behavior
(function () {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const splash = document.getElementById('splash');
  const login = document.getElementById('login');
  const appRoot = document.getElementById('app');
  const layout = document.getElementById('layout');

  const loginForm = document.getElementById('loginForm');
  const loginErro = document.getElementById('loginErro');

  const toggleBtn = document.getElementById('toggleSidebar');
  const logoutBtn = document.getElementById('logoutBtn');

  const btnPrincipal = document.getElementById('btnPrincipal');
  const btnSobre = document.getElementById('btnSobre');
  const btnHelp = document.getElementById('btnHelp');

  const sectionPrincipal = document.getElementById('principal');
  const sectionSobre = document.getElementById('sobre');
  const sectionHelp = document.getElementById('help');

  const calcForm = document.getElementById('calcForm');
  const resultadoBox = document.getElementById('resultadoBox');
  const multiplicadorText = document.getElementById('multiplicadorText');
  const precoVendaText = document.getElementById('precoVendaText');

  let sidebarAberta = true;

  function showScreen(name) {
    splash.style.display = name === 'splash' ? '' : 'none';
    login.style.display = name === 'login' ? '' : 'none';
    appRoot.style.display = name === 'app' ? '' : 'none';

    if (name === 'app') {
      // ensure icons are created
      if (window.lucide) window.lucide.createIcons();
    }
  }

  // Splash -> Login after 3s
  async function start() {
    showScreen('splash');
    await sleep(3000);
    showScreen('login');
  }

  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;
    if (usuario === 'admin' && senha === '1234') {
      loginErro.style.display = 'none';
      showScreen('app');
    } else {
      loginErro.textContent = 'Usuário ou senha incorretos!';
      loginErro.style.display = '';
    }
  });

  toggleBtn.addEventListener('click', function () {
    sidebarAberta = !sidebarAberta;
    if (sidebarAberta) {
      layout.classList.remove('sidebar-recolhida');
      layout.classList.add('sidebar-expandida');
    } else {
      layout.classList.remove('sidebar-expandida');
      layout.classList.add('sidebar-recolhida');
    }
    if (window.lucide) window.lucide.createIcons();
  });

  logoutBtn.addEventListener('click', function () {
    showScreen('login');
  });

  function setActive(btn) {
    [btnPrincipal, btnSobre, btnHelp].forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }

  btnPrincipal.addEventListener('click', function () {
    setActive(btnPrincipal);
    sectionPrincipal.style.display = '';
    sectionSobre.style.display = 'none';
    sectionHelp.style.display = 'none';
  });
  btnSobre.addEventListener('click', function () {
    setActive(btnSobre);
    sectionPrincipal.style.display = 'none';
    sectionSobre.style.display = '';
    sectionHelp.style.display = 'none';
  });
  btnHelp.addEventListener('click', function () {
    setActive(btnHelp);
    sectionPrincipal.style.display = 'none';
    sectionSobre.style.display = 'none';
    sectionHelp.style.display = '';
  });

  calcForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const custoProduto = document.getElementById('custoProduto').value;
    const despesasVariaveis = document.getElementById('despesasVariaveis').value;
    const despesasFixas = document.getElementById('despesasFixas').value;
    const margemLucro = document.getElementById('margemLucro').value;

    try {
      const res = await fetch('/MKP/markup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ custoProduto, despesasVariaveis, despesasFixas, margemLucro })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || data.erro || 'Ocorreu um erro ao processar o cálculo.');
        return;
      }

      multiplicadorText.textContent = (data.multiplicador || data.multiplicador).toString() + 'x';
      precoVendaText.textContent = 'R$ ' + (data.precoVenda || data.precoVenda);
      resultadoBox.style.display = '';
    } catch (err) {
      console.error('Erro ao conectar com a API:', err);
      alert('Não foi possível conectar ao servidor backend. Verifique se ele está rodando.');
    }
  });

  // start UI
  start();
})();
