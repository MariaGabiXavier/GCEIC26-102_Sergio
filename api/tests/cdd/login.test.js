const { login } = require("../../src/cdd/controllers/login");

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockRequest = (body) => ({ body });

const ERRO_AUTENTICACAO = { erro: "Login ou senha de usuario incorreta" };
const ERRO_VALIDACAO = { erro: "Corpo da requisição inválido" };

const callLogin = (body) => {
  const req = mockRequest(body);
  const res = mockResponse();
  login(req, res);
  return res;
};

describe("login", () => {
  describe("sucesso (200)", () => {
    it("responde com 200 e mensagem de sucesso quando login e senha estão corretos", () => {
      const res = callLogin({ login: "usuario1", password: "1234" });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith("Login efetuado com sucesso!");
    });
  });

  describe("erro de autenticação (401)", () => {
    it.each([
      ["login está incorreto", { login: "usuarioErrado", password: "1234" }],
      ["senha está incorreta", { login: "usuario1", password: "senhaErrada" }],
      ["login e senha estão incorretos", { login: "outro", password: "outra" }],
      ["é case-sensitive no login", { login: "Usuario1", password: "1234" }],
      ["login e senha estão vazios (strings vazias)", { login: "", password: "" }],
    ])("responde com 401 quando %s", (_, body) => {
      const res = callLogin(body);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(ERRO_AUTENTICACAO);
    });
  });

  describe("erro de validação (400)", () => {
    it.each([
      ["body é undefined", undefined],
      ["body é null", null],
      ["body não contém o campo login", { password: "1234" }],
      ["body não contém o campo password", { login: "usuario1" }],
      ["login não é uma string", { login: 123, password: "1234" }],
      ["password não é uma string", { login: "usuario1", password: 1234 }],
      ["body é uma string", "usuario1:1234"],
    ])("responde com 400 quando %s", (_, body) => {
      const res = callLogin(body);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(ERRO_VALIDACAO);
    });
  });
});
