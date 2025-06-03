module.exports = (sequelize, Sequelize) => {
  const Temporada = sequelize.define("temporada", {
    nombre: {
      type: Sequelize.STRING,
    },
    fecha_inicio: {
      type: Sequelize.DATE,
    },
    fecha_fin: {
      type: Sequelize.DATE,
    },
    estado: {
      type: Sequelize.STRING,
    },
  });
  return Temporada;
};
