module.exports = (sequelize, Sequelize) => {
  const Producto = sequelize.define("producto", {
    nombre: {
      type: Sequelize.STRING,
    },
    categoria: {
      type: Sequelize.STRING,
    },
    precio: {
      type: Sequelize.DECIMAL(12, 4),
    },
    es_destacado: {
      type: Sequelize.BOOLEAN,
    },
    stock: {
      type: Sequelize.INTEGER,
    },
    punto_extra: {
      type: Sequelize.INTEGER,
    },
    estado: {
      type: Sequelize.BOOLEAN,
    },
    imagenUrl: {
      type: Sequelize.VIRTUAL,
      get() {
        // eslint-disable-next-line no-undef
        return `${process.env.BASE_URL}images/productos/${this.getDataValue("id")}.png`;
      },
    },
  });
  return Producto;
};
