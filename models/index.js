const dbConfig = require("../config/db.config");
const Sequelize = require("sequelize");

const sequelize = new Sequelize(
    dbConfig.DB,
    dbConfig.USER,
    dbConfig.PASSWORD,
    {
        host: dbConfig.HOST,
        dialect: dbConfig.dialect,
        port: dbConfig.PORT,
    }
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.usuarios = require("./usuario.model")(sequelize, Sequelize);
db.tokens = require("./usuarioauth.model")(sequelize, Sequelize);
db.productos = require("./producto.model")(sequelize, Sequelize);
db.temporadas = require("./temporada.model")(sequelize, Sequelize);
db.desafios = require("./desafio.model")(sequelize, Sequelize);
//db.progresos_desafio = require("./progreso_desafio.model")(sequelize, Sequelize);
db.rankings = require("./ranking.model")(sequelize, Sequelize);
db.insignias = require("./insignia.model")(sequelize, Sequelize);
db.insignias_usuario = require("./insignia_usuario.model")(sequelize, Sequelize);
db.premios = require("./premio.model")(sequelize, Sequelize);
db.premios_usuario = require("./premio_usuario.model")(sequelize, Sequelize);
db.compras = require("./compra.model")(sequelize, Sequelize);
db.detalles_compra = require("./detalle_compra.model")(sequelize, Sequelize);


db.usuarios.hasMany(db.tokens, { as: "tokens", foreignKey: "usuario_id", onDelete: "CASCADE"});
db.tokens.belongsTo(db.usuarios, {
    foreignKey: "usuario_id",
    as: "usuario",
});

// Relaciones Temporada - Desafío
db.temporadas.hasMany(db.desafios, { as: "desafios", foreignKey: "temporada_id", onDelete: "CASCADE" });
db.desafios.belongsTo(db.temporadas, {
    foreignKey: "temporada_id",
    as: "temporada",
});

// Relaciones Usuario - ProgresoDesafio - Desafío
// db.usuarios.hasMany(db.progresos_desafio, { as: "progresos", foreignKey: "usuario_id", onDelete: "CASCADE" });
// db.desafios.hasMany(db.progresos_desafio, { as: "progresos", foreignKey: "desafio_id", onDelete: "CASCADE" });
// db.progresos_desafio.belongsTo(db.usuarios, {
//     foreignKey: "usuario_id",
//     as: "usuario",
// });
// db.progresos_desafio.belongsTo(db.desafios, {
//     foreignKey: "desafio_id",
//     as: "desafio",
// });

// Relaciones Usuario - Insignia (a través de InsigniaUsuario)
db.usuarios.belongsToMany(db.insignias, { 
    through: db.insignias_usuario,
    foreignKey: "usuario_id",
    otherKey: "insignia_id",
    as: "insignias"
});
db.insignias.belongsToMany(db.usuarios, { 
    through: db.insignias_usuario,
    foreignKey: "insignia_id",
    otherKey: "usuario_id",
    as: "usuarios"
});

// Relaciones directas con InsigniaUsuario
db.usuarios.hasMany(db.insignias_usuario, { as: "insignias_obtenidas", foreignKey: "usuario_id", onDelete: "CASCADE" });
db.insignias.hasMany(db.insignias_usuario, { as: "usuarios_obtuvieron", foreignKey: "insignia_id", onDelete: "CASCADE" });
db.insignias_usuario.belongsTo(db.usuarios, { foreignKey: "usuario_id", as: "usuario" });
db.insignias_usuario.belongsTo(db.insignias, { foreignKey: "insignia_id", as: "insignia" });

// Relaciones InsigniaUsuario con Temporada
db.temporadas.hasMany(db.insignias_usuario, { as: "insignias_usuarios", foreignKey: "temporada_id", onDelete: "CASCADE" });
db.insignias_usuario.belongsTo(db.temporadas, {
    foreignKey: "temporada_id",
    as: "temporada",
});

// Relaciones Usuario - Compra
db.usuarios.hasMany(db.compras, { as: "compras", foreignKey: "usuario_id", onDelete: "CASCADE" });
db.compras.belongsTo(db.usuarios, {
    foreignKey: "usuario_id",
    as: "usuario",
});

// Relaciones Compra - DetalleCompra - Producto
db.compras.hasMany(db.detalles_compra, { as: "detalles", foreignKey: "compra_id", onDelete: "CASCADE" });
db.detalles_compra.belongsTo(db.compras, {
    foreignKey: "compra_id",
    as: "compra",
});
db.productos.hasMany(db.detalles_compra, { as: "detalles", foreignKey: "producto_id", onDelete: "CASCADE" });
db.detalles_compra.belongsTo(db.productos, {
    foreignKey: "producto_id",
    as: "producto",
});

// Relaciones Usuario - Ranking - Temporada
db.usuarios.hasMany(db.rankings, { as: "rankings", foreignKey: "usuario_id", onDelete: "CASCADE" });
db.temporadas.hasMany(db.rankings, { as: "rankings", foreignKey: "temporada_id", onDelete: "CASCADE" });
db.rankings.belongsTo(db.usuarios, {
    foreignKey: "usuario_id",
    as: "usuario",
});
db.rankings.belongsTo(db.temporadas, {
    foreignKey: "temporada_id",
    as: "temporada",
});

// Relaciones Usuario - Premio (a través de PremioUsuario)
db.usuarios.belongsToMany(db.premios, { 
    through: db.premios_usuario,
    foreignKey: "usuario_id",
    otherKey: "premio_id",
    as: "premios"
});
db.premios.belongsToMany(db.usuarios, { 
    through: db.premios_usuario,
    foreignKey: "premio_id",
    otherKey: "usuario_id",
    as: "usuarios"
});

// Relaciones directas con PremioUsuario
db.usuarios.hasMany(db.premios_usuario, { as: "premios_obtenidos", foreignKey: "usuario_id", onDelete: "CASCADE" });
db.premios.hasMany(db.premios_usuario, { as: "usuarios_obtuvieron", foreignKey: "premio_id", onDelete: "CASCADE" });
db.premios_usuario.belongsTo(db.usuarios, { foreignKey: "usuario_id", as: "usuario" });
db.premios_usuario.belongsTo(db.premios, { foreignKey: "premio_id", as: "premio" });

module.exports = db;