const db = require("../models");
const { checkRequiredFields, sendError500 } = require("../utils/request.utils");

exports.listaPremios = async (req, res) => {
  try {
    const premios = await db.premios.findAll({
      where: { estado: true },
      order: [["id", "ASC"]],
    });
    res.status(200).send(premios);
  } catch (error) {
    sendError500(res, error);
  }
}

exports.listaPremiosByUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    // Usar la relación directa para obtener información completa
    const premiosUsuario = await db.premios_usuario.findAll({
      where: { usuario_id: id },
      include: [
        {
          model: db.premios,
          as: "premio",
          attributes: ["id", "nombre", "descripcion", "estado"],
        }
      ],
      attributes: ["id", "fecha_expiracion", "usado", "fecha_obtencion"],
      order: [["fecha_obtencion", "DESC"]],
    });
    if (!premiosUsuario || premiosUsuario.length === 0) {
      res.status(200).send([]);
      return;
    }
    // Formatear la respuesta usando map (funcional)
    const premiosFormateados = premiosUsuario.map(item => ({
      ...item.premio.toJSON(),
      fecha_expiracion: item.fecha_expiracion,
      usado: item.usado,
      fecha_obtencion: item.fecha_obtencion,
      premio_usuario_id: item.id,
      expirado: new Date() > new Date(item.fecha_expiracion)
    }));
    res.status(200).send(premiosFormateados);
  } catch (error) {
    sendError500(res, error);
  }
}

exports.getPremioById = async (req, res) => { 
  try {
    const { id } = req.params;
    const premio = await db.premios.findByPk(id, {
      attributes: ["id", "nombre", "descripcion", "estado"],
    });
    if (!premio) {
      return res.status(404).send({ message: "Premio no encontrado" });
    }
    res.status(200).send(premio);
  } catch (error) {
    sendError500(res, error);
  }
}

exports.createPremio = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const requiredFields = ["nombre", "descripcion"];
    const missingFields = checkRequiredFields(requiredFields, req.body);
    
    if (missingFields.length > 0) {
      return res.status(400).send({ message: `Faltan campos requeridos: ${missingFields.join(", ")}` });
    }

    const premio = await db.premios.create({
      nombre,
      descripcion,
      estado: true,
    });
    
    res.status(201).send(premio);
  } catch (error) {
    sendError500(res, error);
  }
}

exports.updatePremio = async (req, res) => {
  const { id } = req.params;
  try {
    const premio = await db.premios.findByPk(id);
    if (!premio) {
      return res.status(404).send({ message: "Premio no encontrado" });
    }

    if (req.method === "PUT") {
      const { nombre, descripcion } = req.body;
      const requiredFields = ["nombre", "descripcion"];
      const missingFields = checkRequiredFields(requiredFields, req.body);
      
      if (missingFields.length > 0) {
        return res.status(400).send({ message: `Faltan campos requeridos: ${missingFields.join(", ")}` });
      }

      premio.nombre = nombre;
      premio.descripcion = descripcion;
    }
    await premio.save();
    res.status(200).send({
      message: "Premio actualizado correctamente",
      premio,
    });
  } catch (error) {
    sendError500(res, error);
  }
}

exports.deletePremio = async (req, res) => {
  const { id } = req.params;
  try {
    const premio = await db.premios.findByPk(id);
    if (!premio) {
      return res.status(404).send({ message: "Premio no encontrado" });
    }
    await premio.destroy();
    res.status(200).send({ message: "Premio eliminado correctamente" });
  } catch (error) {
    sendError500(res, error);
  }
}

exports.asignarPremio = async (req, res) => {
  try {
    const { usuario_id, premio_id, fecha_expiracion } = req.body;
    const requiredFields = ["usuario_id", "premio_id", "fecha_expiracion"];
    const missingFields = checkRequiredFields(requiredFields, req.body);
    
    if (missingFields.length > 0) {
      return res.status(400).send({ message: `Faltan campos requeridos: ${missingFields.join(", ")}` });
    }

    // Verificar que el usuario existe
    const usuario = await db.usuarios.findByPk(usuario_id);
    if (!usuario) {
      return res.status(404).send({ message: "Usuario no encontrado" });
    }

    // Verificar que el premio existe
    const premio = await db.premios.findByPk(premio_id);
    if (!premio) {
      return res.status(404).send({ message: "Premio no encontrado" });
    }

    // Verificar que la fecha de expiración sea válida
    const fechaExp = new Date(fecha_expiracion);
    if (isNaN(fechaExp.getTime())) {
      return res.status(400).send({ message: "Fecha de expiración inválida" });
    }

    if (fechaExp <= new Date()) {
      return res.status(400).send({ message: "La fecha de expiración debe ser futura" });
    }

    // Verificar si ya tiene este premio activo (no expirado y no usado)
    const premioExistente = await db.premios_usuario.findOne({
      where: {
        usuario_id,
        premio_id,
        usado: false,
        fecha_expiracion: {
          [db.Sequelize.Op.gt]: new Date()
        }
      }
    });

    if (premioExistente) {
      return res.status(400).send({ message: "El usuario ya tiene este premio activo" });
    }

    // Asignar el premio
    const premioUsuario = await db.premios_usuario.create({
      usuario_id,
      premio_id,
      fecha_expiracion: fechaExp,
      usado: false,
      fecha_obtencion: new Date()
    });

    res.status(201).send({
      message: "Premio asignado correctamente",
      premio_usuario: premioUsuario
    });
  } catch (error) {
    sendError500(res, error);
  }
}

exports.usarPremio = async (req, res) => {
  try {
    const { id } = req.params; // ID de la relación premio_usuario
    
    const premioUsuario = await db.premios_usuario.findByPk(id, {
      include: [
        {
          model: db.premios,
          as: "premio",
          attributes: ["id", "nombre", "descripcion"],
        }
      ]
    });

    if (!premioUsuario) {
      return res.status(404).send({ message: "Premio de usuario no encontrado" });
    }

    // Verificar que no esté expirado
    if (new Date() > new Date(premioUsuario.fecha_expiracion)) {
      return res.status(400).send({ message: "El premio ha expirado" });
    }

    // Verificar que no esté usado
    if (premioUsuario.usado) {
      return res.status(400).send({ message: "El premio ya ha sido usado" });
    }

    // Marcar como usado
    premioUsuario.usado = true;
    await premioUsuario.save();

    res.status(200).send({
      message: "Premio usado correctamente",
      premio: premioUsuario.premio,
      fecha_uso: new Date()
    });
  } catch (error) {
    sendError500(res, error);
  }
}

exports.removerPremio = async (req, res) => {
  try {
    const { id } = req.params; // ID de la relación premio_usuario
    
    const premioUsuario = await db.premios_usuario.findByPk(id);
    if (!premioUsuario) {
      return res.status(404).send({ message: "Relación premio-usuario no encontrada" });
    }

    await premioUsuario.destroy();
    res.status(200).send({ message: "Premio removido correctamente" });
  } catch (error) {
    sendError500(res, error);
  }
}

exports.premiosDisponibles = async (req, res) => {
  try {
    const { id } = req.params; // ID del usuario
    // Obtener premios activos del usuario (no expirados y no usados)
    const premiosDisponibles = await db.premios_usuario.findAll({
      where: {
        usuario_id: id,
        usado: false,
        fecha_expiracion: {
          [db.Sequelize.Op.gt]: new Date()
        }
      },
      include: [
        {
          model: db.premios,
          as: "premio",
          attributes: ["id", "nombre", "descripcion"],
        }
      ],
      attributes: ["id", "fecha_expiracion", "fecha_obtencion"],
      order: [["fecha_expiracion", "ASC"]], // Ordenar por fecha de expiración más cercana
    });
    // Formatear la respuesta usando map (funcional)
    const premiosFormateados = premiosDisponibles.map(item => ({
      ...item.premio.toJSON(),
      fecha_expiracion: item.fecha_expiracion,
      fecha_obtencion: item.fecha_obtencion,
      premio_usuario_id: item.id,
      dias_restantes: Math.ceil((new Date(item.fecha_expiracion) - new Date()) / (1000 * 60 * 60 * 24))
    }));
    res.status(200).send(premiosFormateados);
  } catch (error) {
    sendError500(res, error);
  }
} 