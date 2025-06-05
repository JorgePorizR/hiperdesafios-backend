const db = require("../models");
const { checkRequiredFields, sendError500 } = require("../utils/request.utils");

exports.listaComprasByUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const compras = await db.compras.findAll({
      where: {
        usuario_id: id,
      },
      include: [
        {
          model: db.productos,
          as: 'productos',
        },
        {
          model: db.detalles_compra,
          as: 'detalles',
        },
      ],
    });
    res.status(200).json(compras);
  } catch (error) {
    sendError500(res, error);
  }
}

exports.getCompraById = async (req, res) => {
  try {
    const { id } = req.params;
    const compra = await db.compras.findOne({
      where: {
        id: id,
      },
      include: [
        {
          model: db.productos,
          as: 'productos',
        },
        {
          model: db.detalles_compra,
          as: 'detalles',
        },
      ],
    });
    if (!compra) {
      return res.status(404).json({ message: "Compra no encontrada" });
    }
    res.status(200).json(compra);
  } catch (error) {
    sendError500(res, error);
  }
}

exports.createCompra = async (req, res) => {
  try {
    const { usuario_id, productos } = req.body;
    const requiredFields = ["usuario_id", "productos"];
    const missingFields = checkRequiredFields(requiredFields, req.body);
    if (missingFields.length > 0) {
      return res.status(400).send({ message: `Faltan los siguientes campos: ${missingFields.join(", ")}` });
    }

    const sucursales = ['Sucursal A', 'Sucursal B', 'Sucursal C', 'Sucursal D', 'Sucursal E'];
    const sucursalAleatoria = sucursales[Math.floor(Math.random() * sucursales.length)];
    const usuario = await db.usuarios.findByPk(usuario_id);
    if (!usuario) {
      return res.status(404).send({ message: "Usuario no encontrado" });
    }

    const compra = await db.compras.create({
      usuario_id: usuario_id,
      fecha_compra: new Date(),
      monto_total: productos.reduce((total, producto) => total + (producto.cantidad * producto.precio_unitario), 0),
      puntos_ganados: productos.reduce((total, producto) => total + producto.precio_unitario, 0),
      sucursal: sucursalAleatoria,
    });

    // Asociar productos a la compra
    for (const producto of productos) {
      await db.detalles_compra.create({
        compra_id: compra.id,
        producto_id: producto.id,
        cantidad: producto.cantidad,
        precio_unitario: producto.precio_unitario,
        subtotal: producto.cantidad * producto.precio_unitario,
      });
    }

    res.status(201).send(compra);
  } catch (error) {
    sendError500(res, error);
  }
}

exports.deleteCompra = async (req, res) => {
  try {
    const { id } = req.params;
    const compra = await db.compras.findByPk(id);
    if (!compra) {
      return res.status(404).send({ message: "Compra no encontrada" });
    }
    await db.detalles_compra.destroy({
      where: {
        compra_id: id,
      },
    });
    await db.compras.destroy({
      where: {
        id: id,
      },
    });
    res.status(204).send({ message: "Compra eliminada exitosamente" });
  } catch (error) {
    sendError500(res, error);
  }
}