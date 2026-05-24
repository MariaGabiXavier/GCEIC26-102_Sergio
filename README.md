# GCEIC26-102

Projeto final de GCEIC - turma 102.

## Tema CLT+

Calculadora CLT empresarial para estimar:

- salario liquido do funcionario;
- custo mensal e anual da contratacao para a empresa;
- lucro ou prejuizo estimado a partir da receita gerada pelo funcionario.

## Rotas da API

Base local: `http://localhost:3001/api/clt`

- `POST /login`
- `POST /auth`
- `GET /tabelas`
- `POST /salario-liquido`
- `POST /custo-empresa`
- `POST /resultado-contratacao`

Usuario e senha fixos: `adm` / `adm`.

## Rotas do app

Base local: `http://localhost:3000/clt`

- `/clt` - splash screen
- `/clt/login` - login
- `/clt/dashboard` - inicio
- `/clt/calculadora` - simulador principal
- `/clt/about` - sobre e equipe
- `/clt/help` - ajuda

## Como rodar

Em um terminal:

```bash
cd api
npm install
npm start
```

Em outro terminal:

```bash
cd app
npm install
npm start
```

## Testes

```bash
cd api
npm test
```

## Cronograma de features

- 25/05: API CLT, app web e testes unitarios.
- 01/06: testes funcionais, revisao visual, apresentacao e deploy.

## Observacao

Os calculos usam tabelas e percentuais de referencia para fins educacionais. Valores reais podem variar conforme regime tributario, convencao coletiva, CNAE/FAP e politicas de beneficios da empresa.
