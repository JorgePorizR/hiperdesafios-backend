module.exports = app => {
    // rutas de acceso
    require("./auth.routes")(app);
    require("./compra.routes")(app);
    require("./desafio.routes")(app);
    require("./insignia.routes")(app);
    require("./producto.routes")(app);
    require("./ranking.routes")(app);
    require("./temporada.routes")(app);
    require("./usuario.routes")(app);
}