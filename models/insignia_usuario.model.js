module.exports = (sequelize, Sequelize) => {
  const InsigniaUsuario = sequelize.define("insignia_usuario", {
    fecha_obtencion: {
      type: Sequelize.DATE,
    },
    usuario_id: {
      type: Sequelize.INTEGER,
    },
    insignia_id: {
      type: Sequelize.INTEGER,
    },
    temporada_id: {
      type: Sequelize.INTEGER,
    },
  });
  return InsigniaUsuario;
};