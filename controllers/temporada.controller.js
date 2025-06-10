const db = require("../models");
const { checkRequiredFields, sendError500 } = require("../utils/request.utils");

exports.listaTemporadas = async (req, res) => {
  try {
    const temporadas = await db.temporadas.findAll({
      attributes: ["id", "nombre", "fecha_inicio", "fecha_fin", "estado"],
      order: [["id", "DESC"]],
    });
    res.status(200).send(temporadas);
  } catch (error) {
    sendError500(res, error);
  }
};

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
};

exports.createTemporada = async (req, res) => {
  try {
    const { nombre, fecha_fin } = req.body;
    const requiredFields = ["nombre", "fecha_fin"];
    const missingFields = checkRequiredFields(requiredFields, req.body);

    if (missingFields.length > 0) {
      return res.status(400).send({
        message: `Faltan los siguientes campos: ${missingFields.join(", ")}`,
      });
    }

    const nuevaTemporada = await db.temporadas.create({
      nombre,
      fecha_inicio: new Date(),
      fecha_fin: new Date(fecha_fin),
      estado: "DESACTIVA",
    });

    res.status(201).send(nuevaTemporada);
  } catch (error) {
    sendError500(res, error);
  }
};

exports.updateTemporada = async (req, res) => {
  const { id } = req.params;
  try {
    const temporada = await db.temporadas.findByPk(id);
    if (!temporada) {
      return res.status(404).send({ message: "Temporada no encontrada" });
    }

    if (req.method === "PUT") {
      const { nombre, fecha_inicio, fecha_fin, estado } = req.body;
      const requiredFields = ["nombre", "fecha_inicio", "fecha_fin", "estado"];
      const missingFields = checkRequiredFields(req.body, requiredFields);

      if (missingFields.length > 0) {
        return res.status(400).send({
          message: `Faltan los siguientes campos: ${missingFields.join(", ")}`,
        });
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
};

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
};

exports.activateTemporada = async (req, res) => {
  if (!res.locals.user.es_admin) {
    res.status(403).send({ message: "No tienes permisos para realizar esto" });
    return;
  }
  const { id } = req.params;
  try {
    const temporada = await db.temporadas.findByPk(id);
    if (!temporada) {
      return res.status(404).send({ message: "Temporada no encontrada" });
    }

    const temporadaActivaAnterior = await db.temporadas.findOne({
      where: { estado: "ACTIVA" },
    });

    // Verificar que la temporada no esté ya activa
    if (temporada.estado === "ACTIVA") {
      return res.status(400).send({ message: "La temporada ya está activa" });
    }

    if (temporadaActivaAnterior) {
      // Desactivar todos los desafíos de la temporada
      await db.desafios.update(
        { estado: false },
        { where: { temporada_id: temporadaActivaAnterior.id } }
      );

      // entregar insignias a los usuarios de la temporada
      const insigniasTemporada = await db.insignias.findAll({
        where: { estado: true },
      });

      for (const insignia of insigniasTemporada) {
        switch (insignia.requirimiento) {
          case "primero":
            const primerUsuarioRanking = await db.rankings.findOne({
              where: { temporada_id: temporadaActivaAnterior.id, posicion: 1 },
              attributes: ["usuario_id"],
            });
            if (primerUsuarioRanking) {
              await db.insignias_usuario.create({
                usuario_id: primerUsuarioRanking.usuario_id,
                insignia_id: insignia.id,
                fecha_obtencion: new Date(),
                temporada_id: temporadaActivaAnterior.id,
              });
            }
            break;
          case "segundo":
            const segundoUsuarioRanking = await db.rankings.findOne({
              where: { temporada_id: temporadaActivaAnterior.id, posicion: 2 },
              attributes: ["usuario_id"],
            });
            if (segundoUsuarioRanking) {
              await db.insignias_usuario.create({
                usuario_id: segundoUsuarioRanking.usuario_id,
                insignia_id: insignia.id,
                fecha_obtencion: new Date(),
                temporada_id: temporadaActivaAnterior.id,
              });
            }
            break;
          case "tercero":
            const terceroUsuarioRanking = await db.rankings.findOne({
              where: { temporada_id: temporadaActivaAnterior.id, posicion: 3 },
              attributes: ["usuario_id"],
            });
            if (terceroUsuarioRanking) {
              await db.insignias_usuario.create({
                usuario_id: terceroUsuarioRanking.usuario_id,
                insignia_id: insignia.id,
                fecha_obtencion: new Date(),
                temporada_id: temporadaActivaAnterior.id,
              });
            }
            break;
          default:
            break;
        }
      }
      // Actualizar el estado de la temporada anterior a "TERMINADA"
      await temporadaActivaAnterior.update({
        estado: "TERMINADA",
        fecha_fin: new Date(),
      });
    }

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
};
