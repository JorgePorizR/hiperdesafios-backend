const { checkUserMiddleware } = require('../middlewares/check-user.middleware.js');

module.exports = (app) => {
  const controller = require('../controllers/insignia.controller.js');
  let router = require('express').Router();

  router.get('/', checkUserMiddleware, controller.listaInsignias);
  router.get('/usuario/:id', checkUserMiddleware, controller.listaInsigniasByUsuario);
  router.get('/:id', checkUserMiddleware, controller.getInsigniaById);
  router.post('/', checkUserMiddleware, controller.createInsignia);
  router.put('/:id', checkUserMiddleware, controller.updateInsignia);
  router.delete('/:id', checkUserMiddleware, controller.deleteInsignia);
  router.post('/:id/imagen', checkUserMiddleware, controller.uploadImage);
  
  // Nuevas rutas para gestión de insignias de usuarios
  router.post('/asignar', checkUserMiddleware, controller.asignarInsignia);
  router.delete('/usuario/:id', checkUserMiddleware, controller.removerInsignia);

  app.use('/api/insignias', router);
}