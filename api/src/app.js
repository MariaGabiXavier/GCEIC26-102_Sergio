const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const etec1 = require("./Time_2(ETEC1)/etec1.route");
const exgRouter = require("./exg/exgApp");
const cltRouter = require("./clt/cltApp");
const dasn = require("./Time_8(DASN)/dasn");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// checa se api no ar
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    by: "SLMM36",
    turma: "101",
  });
});

app.get("/api/tabelas", (req, res) => {
  const { TABELA } = require("./funcoes");
  res.json({
    success: true,
    data: {
      base: TABELA.BASE_CALC.faixas,
      referencia: `${TABELA.REFERENCIA * 100}%`,
    },
  });
});

// POST /api/calcular
app.post("/api/calcular", (req, res) => {
  try {
    const { calcular } = require("./funcoes");
    const dados = req.body;
    console.log(dados);

    if (!dados || typeof dados !== "object") {
      return res.status(400).json({ error: "Corpo da requisicao invalido" });
    }

    const resultado = calcular(dados);
    console.log(resultado);
    return res.status(200).json({ success: true, data: resultado });
  } catch (err) {
    console.log(err.message);
    return res.status(400).json({ success: false, error: err.message });
  }
});

app.use("/ETEC1", etec1);
app.use("/api/exg", exgRouter);
app.use("/api/clt", cltRouter);
app.use("/DASN", dasn);

// Rotas CD (compilado TS)
const cdRouter = require("./cdd/routes/dividendRouter").default;
app.use("/api/cdd", cdRouter);

module.exports = app;
