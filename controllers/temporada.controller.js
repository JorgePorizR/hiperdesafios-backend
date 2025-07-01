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
    return res.status(403).send({ message: "No tienes permisos para realizar esto" });
  }
  const { id } = req.params;
  try {
    const temporada = await db.temporadas.findByPk(id);
    if (!temporada) return res.status(404).send({ message: "Temporada no encontrada" });

    const temporadaActivaAnterior = await db.temporadas.findOne({ where: { estado: "ACTIVA" } });
    if (temporada.estado === "ACTIVA") {
      return res.status(400).send({ message: "La temporada ya está activa" });
    }

    // Función pura para obtener usuario según requerimiento
    const getUsuarioPorRequerimiento = async (requerimiento, temporadaId) => {
      const posiciones = { primero: 1, segundo: 2, tercero: 3 };
      if (!posiciones[requerimiento]) return null;
      return db.rankings.findOne({
        where: { temporada_id: temporadaId, posicion: posiciones[requerimiento] },
        attributes: ["usuario_id"],
      });
    };

    // Desactivar desafíos y entregar insignias si hay temporada activa anterior
    if (temporadaActivaAnterior) {
      await db.desafios.update(
        { estado: false },
        { where: { temporada_id: temporadaActivaAnterior.id } }
      );

      // Obtener insignias activas
      const insigniasTemporada = await db.insignias.findAll({ where: { estado: true } });

      // Filtrar insignias con requerimiento válido
      const insigniasValidas = insigniasTemporada.filter(insignia =>
        ["primero", "segundo", "tercero"].includes(insignia.requirimiento)
      );

      // Entregar insignias
      await Promise.all(
        insigniasValidas.map(async insignia => {
          const usuarioRanking = await getUsuarioPorRequerimiento(insignia.requirimiento, temporadaActivaAnterior.id);
          if (usuarioRanking) {
            // Verificar si ya existe la relación para esa temporada
            const yaTiene = await db.insignias_usuario.findOne({
              where: {
                usuario_id: usuarioRanking.usuario_id,
                insignia_id: insignia.id,
                temporada_id: temporadaActivaAnterior.id,
              },
            });
            if (!yaTiene) {
              await db.insignias_usuario.create({
                usuario_id: usuarioRanking.usuario_id,
                insignia_id: insignia.id,
                fecha_obtencion: new Date(),
                temporada_id: temporadaActivaAnterior.id,
              });
            }
          }
        })
      );

      // --- ENTREGA DE PREMIOS TOP 3 ---
      const premiosNombres = ["primero", "segundo", "tercero"];
      // Buscar todos los premios necesarios de una vez
      const premios = await db.premios.findAll({
        where: { nombre: premiosNombres },
      });
      // Mapear nombre -> premio
      const premiosMap = premios.reduce((acc, premio) => {
        acc[premio.nombre] = premio;
        return acc;
      }, {});
      // Para cada puesto, buscar usuario y asignar premio si corresponde
      await Promise.all(
        premiosNombres.map(async (nombre, idx) => {
          const puesto = idx + 1;
          const usuarioRanking = await db.rankings.findOne({
            where: { temporada_id: temporadaActivaAnterior.id, posicion: puesto },
            attributes: ["usuario_id"],
          });
          const premio = premiosMap[nombre];
          if (usuarioRanking && premio) {
            // Verificar si ya tiene el premio activo
            const yaTiene = await db.premios_usuario.findOne({
              where: {
                usuario_id: usuarioRanking.usuario_id,
                premio_id: premio.id,
                usado: false,
                fecha_expiracion: { [db.Sequelize.Op.gt]: new Date() },
              },
            });
            if (!yaTiene) {
              await db.premios_usuario.create({
                usuario_id: usuarioRanking.usuario_id,
                premio_id: premio.id,
                fecha_expiracion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
                usado: false,
                fecha_obtencion: new Date(),
              });
            }
          }
        })
      );
      // --- FIN ENTREGA DE PREMIOS ---

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
