require("dotenv").config({
  path: "../../.env",
});

const runPiscinaTests = require("./Time_10_piscina/piscina-all-screens.test.js");

runPiscinaTests()
  .then(() => {
    console.log("Testes da piscina finalizados");
  })
  .catch((err) => {
    console.error("Erro:", err);
  });