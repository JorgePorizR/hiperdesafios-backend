module.exports = (sequelize, Sequelize) => {
  const InsigniaUsuario = sequelize.define("insignia_usuario", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fecha_obtencion: {
      type: Sequelize.DATE,
    },
    usuario_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    insignia_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    temporada_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  },
  {
    indexes: [
      {
        unique: true,
        fields: ['usuario_id', 'insignia_id', 'temporada_id']
      }
    ]
  });
  return InsigniaUsuario;
};