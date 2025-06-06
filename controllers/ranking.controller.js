const db = require("../models");
const { checkRequiredFields, sendError500 } = require("../utils/request.utils");

exports.getRankingByTemporada = async (req, res) => {
  try {
    const { temporada_id } = req.params;
    const ranking = await db.rankings.findAll({
      where: {
        temporada_id: temporada_id,
      },
      include: [
        {
          model: db.usuarios,
          as: "usuario",
          attributes: ["id", "nombre", "apellido", "email"],
        },
        {
          model: db.temporadas,
          as: "temporada",
          attributes: ["id", "nombre"],
        },
      ],
      order: [["puntos_totales", "DESC"]],
    });
    res.status(200).send(ranking);
  } catch (error) {
    sendError500(res, error);
  }
};