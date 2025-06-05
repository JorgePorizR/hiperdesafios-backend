const { checkUserMiddleware } = require('../middlewares/check-user.middleware.js');

module.exports = (app) => {
  const controller = require('../controllers/producto.controller.js');
  let router = require('express').Router();

  router.get('/', controller.listaProductos);
  router.get('/destacados', controller.listaProductosDestacados);
  router.get('/categoria/:categoria', controller.listaProductosPorCategoria);
  router.get('/:id', controller.getProductoById);
  router.post('/', checkUserMiddleware, controller.createProducto);
  router.put('/:id', checkUserMiddleware, controller.updateProducto);
  router.patch('/:id', checkUserMiddleware, controller.updateProducto);
  router.delete('/:id', checkUserMiddleware, controller.deleteProducto);
  router.post('/:id/imagen', checkUserMiddleware, controller.uploadImage);

  app.use('/api/productos', router);
};
