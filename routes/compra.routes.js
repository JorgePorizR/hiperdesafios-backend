const { checkUserMiddleware } = require('../middlewares/check-user.middleware.js');

module.exports = (app) => {
  const controller = require('../controllers/compra.controller.js');
  let router = require('express').Router();

  router.get('/usuario/:id', checkUserMiddleware, controller.listaComprasByUsuario);
  router.get('/:id', checkUserMiddleware, controller.getCompraById);
  router.post('/', checkUserMiddleware, controller.createCompra);
  router.delete('/:id', checkUserMiddleware, controller.deleteCompra);

  app.use('/api/compras', router);
}