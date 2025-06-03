module.exports = (sequelize, Sequelize) => {
  const DetalleCompra = sequelize.define("detalle_compra", {
    compra_id: {
      type: Sequelize.INTEGER,
    },
    producto_id: {
      type: Sequelize.INTEGER,
    },
    cantidad: {
      type: Sequelize.INTEGER,
    },
    precio_unitario: {
      type: Sequelize.DECIMAL(12, 4),
    },
    subtotal: {
      type: Sequelize.DECIMAL(12, 4),
    },
  });
  return DetalleCompra;
};