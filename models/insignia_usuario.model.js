module.exports = (sequelize, Sequelize) => {
  const InsigniaUsuario = sequelize.define("insignia_usuario", {
    usuario_id: {
      type: Sequelize.INTEGER,
    },
    insignia_id: {
      type: Sequelize.INTEGER,
    },
    temporada_id: {
      type: Sequelize.INTEGER,
    },
    fecha_obtencion: {
      type: Sequelize.DATE,
    },
  });
  return InsigniaUsuario;
};