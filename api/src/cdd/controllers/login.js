"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
function isLoginInput(body) {
    return (typeof body === "object" &&
        body !== null &&
        typeof body.login === "string" &&
        typeof body.password === "string");
}
function login(req, res) {
    if (!isLoginInput(req.body)) {
        return res.status(400).json({ erro: "Corpo da requisição inválido" });
    }
    if (req.body.login === "usuario1" && req.body.password === "1234") {
        return res.status(200).json("Login efetuado com sucesso!");
    }
    return res.status(401).json({ erro: "Login ou senha de usuario incorreta" });
}
//# sourceMappingURL=login.js.map