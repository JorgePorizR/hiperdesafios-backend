module.exports = (sequelize, Sequelize) => {
  const Ranking = sequelize.define("ranking", {
    temporada_id: {
      type: Sequelize.INTEGER,
    },
    usuario_id: {
      type: Sequelize.INTEGER,
    },
    posicion: {
      type: Sequelize.INTEGER,
    },
    puntos_totales: {
      type: Sequelize.INTEGER,
    },
  });
  return Ranking;
}