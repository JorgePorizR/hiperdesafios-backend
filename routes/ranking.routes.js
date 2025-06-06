const { checkUserMiddleware } = require('../middlewares/check-user.middleware.js');

module.exports = (app) => {
  const controller = require('../controllers/ranking.controller.js');
  let router = require('express').Router();

  router.get('/temporada/:temporada_id', controller.getRankingByTemporada);

  app.use('/api/rankings', router);
};
