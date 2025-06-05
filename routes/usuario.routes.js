const {
  checkUserMiddleware,
} = require("../middlewares/check-user.middleware.js");

module.exports = (app) => {
  const controller = require("../controllers/usuario.controller.js");
  let router = require("express").Router();

  router.get("/", checkUserMiddleware, controller.listaUsuarios);
  router.get("/admins", checkUserMiddleware, controller.listaUsuariosAdmin);
  router.get("/:id", checkUserMiddleware, controller.getUsuario);
  router.post("/", checkUserMiddleware, controller.createUsuarioCliente);
  router.post("/admin", checkUserMiddleware, controller.createUsuarioAdmin);
  router.put("/:id", checkUserMiddleware, controller.updateUsuario);
  router.patch("/:id", checkUserMiddleware, controller.updateUsuario);
  router.delete("/:id", checkUserMiddleware, controller.deleteUsuario);

  app.use("/api/usuarios", router);
};
