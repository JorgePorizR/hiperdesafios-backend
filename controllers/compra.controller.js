const db = require("../models");
const Compra = db.compra;
const Op = db.Sequelize.Op;

// Create and Save a new Compra
exports.create = (req, res) => {
  // Validate request
  if (!req.body.usuario_id || !req.body.monto_total) {
    res.status(400).send({
      message: "Content can not be empty! Usuario ID and Monto Total are required!"
    });
    return;
  }

  // Create a Compra
  const compra = {
    usuario_id: req.body.usuario_id,
    fecha_compra: req.body.fecha_compra || new Date(),
    monto_total: req.body.monto_total,
    puntos_ganados: req.body.puntos_ganados || 0,
    sucursal: req.body.sucursal
  };

  // Save Compra in the database
  Compra.create(compra)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Compra."
      });
    });
};

// Retrieve all Compras from the database
exports.findAll = (req, res) => {
  const usuario_id = req.query.usuario_id;
  var condition = usuario_id ? { usuario_id: { [Op.eq]: usuario_id } } : null;

  Compra.findAll({ where: condition })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving compras."
      });
    });
};

// Find a single Compra with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Compra.findByPk(id)
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Compra with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Compra with id=" + id
      });
    });
};

// Update a Compra by the id
exports.update = (req, res) => {
  const id = req.params.id;

  Compra.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Compra was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update Compra with id=${id}. Maybe Compra was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Compra with id=" + id
      });
    });
};

// Delete a Compra with the specified id
exports.delete = (req, res) => {
  const id = req.params.id;

  Compra.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Compra was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete Compra with id=${id}. Maybe Compra was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Compra with id=" + id
      });
    });
}; 