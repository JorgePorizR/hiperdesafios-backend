module.exports = (sequelize, Sequelize) => {
  const PremioUsuario = sequelize.define("premio_usuario", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fecha_expiracion: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    usado: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    fecha_obtencion: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
    usuario_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    premio_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  });
  return PremioUsuario;
}; 