const db = require("../models");
const { stringToSha1 } = require("../utils/crypto.utils");
const { checkRequiredFields, sendError500 } = require("../utils/request.utils");

exports.listaUsuarios = async (req, res) => {
  if (!res.locals.user.es_admin) {
    res.status(403).send({ message: "No tienes permisos para realizar esto" });
    return;
  }
  try {
    const usuarios = await db.usuarios.findAll({
      where: {
        es_admin: false,
      },
      include: [
        {
          model: db.billeteras,
          as: "billeteras",
          include: [
            {
              model: db.movimientos,
              as: "movimientos",
            },
          ],
        },
      ],
    });
    res.send(usuarios);
  } catch (error) {
    sendError500(res, error);
  }
};

exports.listaUsuariosAdmin = async (req, res) => {
  if (!res.locals.user.es_admin) {
    res.status(403).send({ message: "No tienes permisos para realizar esto" });
    return;
  }
  try {
    const usuarios = await db.usuarios.findAll({
      where: {
        es_admin: true,
      },
    });
    res.send(usuarios);
  } catch (error) {
    sendError500(res, error);
  }
};

exports.getUsuario = async (req, res) => {
  if (!res.locals.user.es_admin) {
    res.status(403).send({ message: "No tienes permisos para realizar esto" });
    return;
  }
  const id = req.params.id;
  try {
    const usuario = await db.usuarios.findByPk(id, {
      where: {
        es_admin: false,
      },
      include: [
        {
          model: db.billeteras,
          as: "billeteras",
          include: [
            {
              model: db.movimientos,
              as: "movimientos",
            },
          ],
        },
      ],
    });
    if (!usuario) {
      res.status(404).send({ message: "Usuario no encontrado" });
      return;
    }
    res.send(usuario);
  } catch (error) {
    sendError500(res, error);
  }
};

exports.createUsuarioCliente = async (req, res) => {
  if (!res.locals.user.es_admin) {
    res.status(403).send({ message: "No tienes permisos para realizar esto" });
    return;
  }
  const requiredFields = ["nombre", "apellido", "email", "password"];
  const fieldsWithErrors = checkRequiredFields(requiredFields, req.body);
  if (fieldsWithErrors.length > 0) {
    res.status(400).send({
      message: `Faltan los siguientes campos: ${fieldsWithErrors.join(", ")}`,
    });
    return;
  }
  try {
    req.body.es_admin = false;
    req.body.password = stringToSha1(req.body.password);
    const usuario = await db.usuarios.create(req.body);
    res.send(usuario);
  } catch (error) {
    sendError500(res, error);
  }
};

exports.createUsuarioAdmin = async (req, res) => {
  if (!res.locals.user.es_admin) {
    res.status(403).send({ message: "No tienes permisos para realizar esto" });
    return;
  }
  const requiredFields = ["nombre", "apellido", "email", "password"];
  const fieldsWithErrors = checkRequiredFields(requiredFields, req.body);
  if (fieldsWithErrors.length > 0) {
    res.status(400).send({
      message: `Faltan los siguientes campos: ${fieldsWithErrors.join(", ")}`,
    });
    return;
  }
  try {
    req.body.es_admin = true;
    req.body.password = stringToSha1(req.body.password);
    const usuario = await db.usuarios.create(req.body);
    res.send(usuario);
  } catch (error) {
    sendError500(res, error);
  }
};

exports.updateUsuario = async (req, res) => {
  if (!res.locals.user.es_admin) {
    res.status(403).send({ message: "No tienes permisos para realizar esto" });
    return;
  }
  const id = req.params.id;
  try {
    const usuario = await db.usuarios.findByPk(id);
    if (!usuario) {
      res.status(404).send({ message: "Usuario no encontrado" });
      return;
    }
    if (req.method === "PUT") {
      const requiredFields = ["nombre", "apellido", "email"];
      const fieldsWithErrors = checkRequiredFields(requiredFields, req.body);
      if (fieldsWithErrors.length > 0) {
        res.status(400).send({
          message: `Faltan los siguientes campos: ${fieldsWithErrors.join(
            ", "
          )}`,
        });
        return;
      }
      req.body.password = usuario.password;
      req.body.es_admin = usuario.es_admin;
    }
    await usuario.update(req.body);
    res.send(usuario);
  } catch (error) {
    sendError500(res, error);
  }
};

exports.deleteUsuario = async (req, res) => {
  if (!res.locals.user.es_admin) {
    res.status(403).send({ message: "No tienes permisos para realizar esto" });
    return;
  }
  const id = req.params.id;
  try {
    const usuario = await db.usuarios.findByPk(id);
    if (!usuario) {
      res.status(404).send({ message: "Usuario no encontrado" });
      return;
    }
    await usuario.destroy();
    res.send({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    sendError500(res, error);
  }
};
