const { checkUserMiddleware } = require('../middlewares/check-user.middleware.js');

module.exports = (app) => {
  const controller = require('../controllers/premio.controller.js');
  let router = require('express').Router();

  // Rutas CRUD básicas para premios
  router.get('/', checkUserMiddleware, controller.listaPremios);
  router.get('/:id', checkUserMiddleware, controller.getPremioById);
  router.post('/', checkUserMiddleware, controller.createPremio);
  router.put('/:id', checkUserMiddleware, controller.updatePremio);
  router.delete('/:id', checkUserMiddleware, controller.deletePremio);
  
  // Rutas para gestión de premios de usuarios
  router.get('/usuario/:id', checkUserMiddleware, controller.listaPremiosByUsuario);
  router.get('/usuario/:id/disponibles', checkUserMiddleware, controller.premiosDisponibles);
  router.post('/asignar', checkUserMiddleware, controller.asignarPremio);
  router.put('/usar/:id', checkUserMiddleware, controller.usarPremio);
  router.delete('/usuario/:id', checkUserMiddleware, controller.removerPremio);

  app.use('/api/premios', router);
} 