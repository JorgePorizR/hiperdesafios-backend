module.exports = (sequelize, Sequelize) => {
  const ProgresoDesafio = sequelize.define("progreso_desafio", {
    usuario_id: {
      type: Sequelize.INTEGER,
    },
    desafio_id: {
      type: Sequelize.INTEGER,
    },
    progreso: {
      type: Sequelize.INTEGER,
    },
    completado: {
      type: Sequelize.BOOLEAN,
    },
    fecha_completado: {
      type: Sequelize.DATE,
    },
  });
  return ProgresoDesafio;
}