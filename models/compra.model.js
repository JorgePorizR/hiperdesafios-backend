module.exports = (sequelize, Sequelize) => {
  const Compra = sequelize.define("compra", {
    usuario_id: {
      type: Sequelize.INTEGER,
    },
    fecha_compra: {
      type: Sequelize.DATE,
    },
    monto_total: {
      type: Sequelize.DECIMAL(12, 4),
    },
    puntos_ganados: {
      type: Sequelize.INTEGER,
    },
    sucursal: {
      type: Sequelize.STRING,
    },
  });
  return Compra;
}