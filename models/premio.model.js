module.exports = (sequelize, Sequelize) => {
  const Premio = sequelize.define("premio", {
    nombre: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    descripcion: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    estado: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    },
  });
  return Premio;
}; 