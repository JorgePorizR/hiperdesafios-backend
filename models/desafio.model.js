module.exports = (sequelize, Sequelize) => {
  const Desafio = sequelize.define("desafio", {
    nombre: {
      type: Sequelize.STRING,
    },
    descripcion: {
      type: Sequelize.STRING,
    },
    temporada_id: {
      type: Sequelize.INTEGER,
    },
    puntos_recompensa: {
      type: Sequelize.INTEGER,
    },
    fecha_inicio: {
      type: Sequelize.DATE,
    },
    fecha_fin: {
      type: Sequelize.DATE,
    },
    estado: {
      type: Sequelize.BOOLEAN,
    },
  });
  return Desafio;
}