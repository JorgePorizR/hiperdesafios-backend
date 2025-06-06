const db = require("../models");
const { checkRequiredFields, sendError500 } = require("../utils/request.utils");

exports.listaDesafios = async (req, res) => {
  try {
    const desafios = await db.desafios.findAll({
      where: {
        estado: true,
      },
      include: [
        {
          model: db.temporadas,
          as: "temporada",
          attributes: ["id", "nombre", "fecha_inicio", "fecha_fin"],
        },
      ],
    });
    res.status(200).send(desafios);
  } catch (error) {
    sendError500(res, error);
  }
};

exports.listaDesafiosActivos = async (req, res) => {
  try {
    const desafios = await db.desafios.findAll({
      where: {
        estado: true,
      },
      include: [
        {
          model: db.temporadas,
          as: "temporada",
          attributes: ["id", "nombre", "fecha_inicio", "fecha_fin"],
        },
      ],
    });
    res.status(200).send(desafios);
  } catch (error) {
    sendError500(res, error);
  }
};

exports.getDesafioById = async (req, res) => {
  const { id } = req.params;
  try {
    const desafio = await db.desafios.findByPk(id, {
      include: [
        {
          model: db.temporadas,
          as: "temporada",
          attributes: ["id", "nombre", "fecha_inicio", "fecha_fin"],
        },
      ],
    });
    if (!desafio) {
      return res.status(404).send({ message: "Desafío no encontrado" });
    }
    res.status(200).send(desafio);
  } catch (error) {
    sendError500(res, error);
  }
}

exports.createDesafio = async (req, res) => {
  const { nombre, descripcion, puntos_recompensa, fecha_fin } = req.body;
  try {
    const requiredFields = ["nombre", "descripcion", "fecha_fin"];
    const missingFields = checkRequiredFields(requiredFields, req.body);
    if (missingFields.length > 0) {
      return res.status(400).send({ message: `Faltan los siguientes campos: ${missingFields.join(", ")}` });
    }

    // saber que temporada_id está activa
    const temporada = await db.temporadas.findOne({
      where: {
        estado: "ACTIVA",
      },
      order: [["fecha_inicio", "DESC"]],
    });
    if (!temporada) {
      return res.status(400).send({ message: "No hay temporadas activas para asociar al desafío" });
    }

    const desafio = await db.desafios.create({
      nombre,
      descripcion,
      temporada_id: temporada.id,
      puntos_recompensa,
      fecha_inicio: new Date(),
      fecha_fin: new Date(fecha_fin),
      estado: true,
    });
    res.status(201).send(desafio);
  } catch (error) {
    sendError500(res, error);
  }
};

exports.updateDesafio = async (req, res) => {
  const { id } = req.params;
  try {
    const desafio = await db.desafios.findByPk(id);
    if (!desafio) {
      return res.status(404).send({ message: "Desafío no encontrado" });
    }

    if (req.method === "PUT") {
      const { nombre, descripcion, puntos_recompensa, estado } = req.body;
      const requiredFields = ["nombre", "descripcion", "puntos_recompensa", "estado"];
      const missingFields = checkRequiredFields(req.body, requiredFields);
      
      if (missingFields.length > 0) {
        return res.status(400).send({ message: `Faltan los siguientes campos: ${missingFields.join(", ")}` });
      }

      desafio.nombre = nombre;
      desafio.descripcion = descripcion;
      desafio.puntos_recompensa = puntos_recompensa;
      desafio.estado = estado;
    }
    await desafio.save();
    res.status(200).send(desafio);
  } catch (error) {
    sendError500(res, error);
  }
};

exports.deleteDesafio = async (req, res) => {
  const { id } = req.params;
  try {
    const desafio = await db.desafios.findByPk(id);
    if (!desafio) {
      return res.status(404).send({ message: "Desafío no encontrado" });
    }
    await desafio.destroy();
    res.status(200).send({ message: "Desafío eliminado correctamente" });
  } catch (error) {
    sendError500(res, error);
  }
};

exports.desactivarDesafio = async (req, res) => {
  const { id } = req.params;
  try {
    const desafio = await db.desafios.findByPk(id);
    if (!desafio) {
      return res.status(404).send({ message: "Desafío no encontrado" });
    }
    
    // Desactivar el desafío
    desafio.estado = false;
    desafio.fecha_fin = new Date();
    await desafio.save();

    res.status(200).send({
      message: "Desafío desactivado correctamente",
      desafio,
    });
  } catch (error) {
    sendError500(res, error);
  }
};