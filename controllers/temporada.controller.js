const db = require("../models");
const { checkRequiredFields, sendError500 } = require("../utils/request.utils");

exports.listaTemporadas = async (req, res) => {
  try {
    const temporadas = await db.temporadas.findAll({
      attributes: ["id", "nombre", "fecha_inicio", "fecha_fin", "estado"],
      order: [["id", "ASC"]],
    });
    res.status(200).send(temporadas);
  } catch (error) {
    sendError500(res, error);
  }
}

exports.getTemporadaById = async (req, res) => {
  try {
    const { id } = req.params;
    const temporada = await db.temporadas.findByPk(id, {
      attributes: ["id", "nombre", "fecha_inicio", "fecha_fin", "estado"],
    });
    if (!temporada) {
      return res.status(404).send({ message: "Temporada no encontrada" });
    }
    res.status(200).send(temporada);
  } catch (error) {
    sendError500(res, error);
  }
}

exports.createTemporada = async (req, res) => {
  try {
    const { nombre } = req.body;
    const requiredFields = ["nombre"];
    const missingFields = checkRequiredFields(requiredFields, req.body);
    
    if (missingFields.length > 0) {
      return res.status(400).send({ message: `Faltan los siguientes campos: ${missingFields.join(", ")}` });
    }

    const nuevaTemporada = await db.temporadas.create({
      nombre,
      fecha_inicio: new Date(),
      fecha_fin: null,
      estado: "DESACTIVA",
    });

    res.status(201).send(nuevaTemporada);
  } catch (error) {
    sendError500(res, error);
  }
}

exports.updateTemporada = async (req, res) => {
  const { id } = req.params;
  try {
    const temporada = await db.temporadas.findByPk(id);
    if (!temporada) {
      return res.status(404).send({ message: "Temporada no encontrada" });
    }

    if (req.method === "PUT"){
      const { nombre, fecha_inicio, fecha_fin, estado } = req.body;
      const requiredFields = ["nombre", "fecha_inicio", "fecha_fin", "estado"];
      const missingFields = checkRequiredFields(req.body, requiredFields);
      
      if (missingFields.length > 0) {
        return res.status(400).send({ message: `Faltan los siguientes campos: ${missingFields.join(", ")}` });
      }

      temporada.nombre = nombre;
      temporada.fecha_inicio = fecha_inicio;
      temporada.fecha_fin = fecha_fin;
      temporada.estado = estado;
    }
    await temporada.save();

    res.status(200).send({
      message: "Temporada actualizada correctamente",
      temporada,
    });
  } catch (error) {
    sendError500(res, error);
  }
}

exports.deleteTemporada = async (req, res) => {
  const { id } = req.params;
  try {
    const temporada = await db.temporadas.findByPk(id);
    if (!temporada) {
      return res.status(404).send({ message: "Temporada no encontrada" });
    }
    
    await temporada.destroy();
    res.status(200).send({ message: "Temporada eliminada correctamente" });
  } catch (error) {
    sendError500(res, error);
  }
}

exports.activateTemporada = async (req, res) => {
  const { id } = req.params;
  try {
    const temporada = await db.temporadas.findByPk(id);
    if (!temporada) {
      return res.status(404).send({ message: "Temporada no encontrada" });
    }

    // Desactivar todas las temporadas activas
    await db.temporadas.update(
      { estado: "TERMINADA" },
      { where: { estado: "ACTIVA" } }
    );

    // Activar la temporada seleccionada
    temporada.estado = "ACTIVA";
    await temporada.save();

    res.status(200).send({
      message: "Temporada activada correctamente",
      temporada,
    });
  } catch (error) {
    sendError500(res, error);
  }
}