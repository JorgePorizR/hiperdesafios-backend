const { checkUserMiddleware } = require('../middlewares/check-user.middleware.js');

module.exports = (app) => {
  const controller = require('../controllers/temporada.controller.js');
  let router = require('express').Router();

  router.get('/', controller.listaTemporadas);
  router.get('/:id', controller.getTemporadaById);
  router.post('/', checkUserMiddleware, controller.createTemporada);
  router.put('/:id', checkUserMiddleware, controller.updateTemporada);
  router.patch('/:id', checkUserMiddleware, controller.updateTemporada);
  router.delete('/:id', checkUserMiddleware, controller.deleteTemporada);
  router.post('/:id/activar', checkUserMiddleware, controller.activateTemporada);

  app.use('/api/temporadas', router);
}