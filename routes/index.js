module.exports = app => {
    // rutas de acceso
    require("./auth.routes")(app);
    require("./producto.routes")(app);
}