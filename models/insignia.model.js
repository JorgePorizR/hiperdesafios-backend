module.exports = (sequelize, Sequelize) => {
  const Insignia = sequelize.define("insignia", {
    nombre: {
      type: Sequelize.STRING,
    },
    descripcion: {
      type: Sequelize.STRING,
    },
    estado: {
      type: Sequelize.BOOLEAN,
    },
    requirimiento: {
      type: Sequelize.STRING,
    },
    cantidad: {
      type: Sequelize.INTEGER,
    },
    imagenUrl: {
      type: Sequelize.VIRTUAL,
      get() {
        // eslint-disable-next-line no-undef
        return `${process.env.BASE_URL}images/insignias/${this.getDataValue("id")}.png`;
      },
    },
  });
  return Insignia;
};