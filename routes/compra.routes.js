const express = require('express');
const router = express.Router();
const compraController = require('../controllers/compra.controller');

// Create a new Compra
router.post('/', compraController.create);

// Retrieve all Compras
router.get('/', compraController.findAll);

// Retrieve a single Compra with id
router.get('/:id', compraController.findOne);

// Update a Compra with id
router.put('/:id', compraController.update);

// Delete a Compra with id
router.delete('/:id', compraController.delete);

module.exports = router; 