const { checkUserMiddleware } = require('../middlewares/check-user.middleware.js');

module.exports = (app) => {
  const controller = require('../controllers/desafio.controller.js');
  let router = require('express').Router();

  router.get('/', controller.listaDesafios);
  router.get('/activos', controller.listaDesafiosActivos);
  router.get('/:id', controller.getDesafioById);
  router.post('/', checkUserMiddleware, controller.createDesafio);
  router.put('/:id', checkUserMiddleware, controller.updateDesafio);
  router.patch('/:id', checkUserMiddleware, controller.updateDesafio);
  router.delete('/:id', checkUserMiddleware, controller.deleteDesafio);
  router.post('/:id/desactivar', checkUserMiddleware, controller.desactivarDesafio);
  router.post('/:id/activar', checkUserMiddleware, controller.activarDesafio);

  app.use('/api/desafios', router);
}