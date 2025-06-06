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
          as: "productos",
        },
        {
          model: db.detalles_compra,
          as: "detalles",
        },
      ],
    });
    res.status(200).send(compras);
  } catch (error) {
    sendError500(res, error);
  }
};

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
          as: "productos",
        },
        {
          model: db.detalles_compra,
          as: "detalles",
        },
      ],
    });
    if (!compra) {
      return res.status(404).send({ message: "Compra no encontrada" });
    }
    res.status(200).send(compra);
  } catch (error) {
    sendError500(res, error);
  }
};

exports.createCompra = async (req, res) => {
  try {
    const { usuario_id, productos } = req.body;
    const requiredFields = ["usuario_id", "productos"];
    const missingFields = checkRequiredFields(requiredFields, req.body);
    if (missingFields.length > 0) {
      return res
        .status(400)
        .send({
          message: `Faltan los siguientes campos: ${missingFields.join(", ")}`,
        });
    }

    const sucursales = [
      "Sucursal A",
      "Sucursal B",
      "Sucursal C",
      "Sucursal D",
      "Sucursal E",
    ];
    const sucursalAleatoria =
      sucursales[Math.floor(Math.random() * sucursales.length)];
    const usuario = await db.usuarios.findByPk(usuario_id);
    if (!usuario) {
      return res.status(404).send({ message: "Usuario no encontrado" });
    }

    let puntosGanados = 0;
    let totalCompra = 0;
    for (const producto of productos) {
      const productoEncontrado = await db.productos.findByPk(
        producto.producto_id
      );
      if (!productoEncontrado) {
        return res
          .status(404)
          .send({
            message: `Producto con ID ${producto.producto_id} no encontrado`,
          });
      }
      if (productoEncontrado.es_destacado) {
        puntosGanados += productoEncontrado.punto_extra * producto.cantidad;
      }
      puntosGanados += producto.cantidad * producto.precio_unitario;
      totalCompra += producto.cantidad * producto.precio_unitario;
    }

    const listaDesafiosActivos = await db.desafios.findAll({
      where: {
        estado: true,
      },
    });

    for (const desafio of listaDesafiosActivos) {
      switch (desafio.nombre) {
        case "puntos extra":
          puntosGanados += desafio.puntos_recompensa;
          break;
        case "2x1":
          puntosGanados += totalCompra * 2;
          break;
        default:
          break;
      }
    }

    const compra = await db.compras.create({
      usuario_id: usuario_id,
      fecha_compra: new Date(),
      monto_total: productos.reduce(
        (total, producto) =>
          total + producto.cantidad * producto.precio_unitario,
        0
      ),
      puntos_ganados: puntosGanados,
      sucursal: sucursalAleatoria,
    });

    // Asociar productos a la compra
    for (const producto of productos) {
      await db.detalles_compra.create({
        compra_id: compra.id,
        producto_id: producto.producto_id,
        cantidad: producto.cantidad,
        precio_unitario: producto.precio_unitario,
        subtotal: producto.cantidad * producto.precio_unitario,
      });
      // Actualizar stock del producto
      const productoEncontrado = await db.productos.findByPk(
        producto.producto_id
      );
      productoEncontrado.stock -= producto.cantidad;
      await productoEncontrado.save();
    }

    // Obtener la temporada actual
    const temporadaActual = await db.temporadas.findOne({
      where: {
        estado: "ACTIVA",
      },
    });
    if (temporadaActual) {
      // Actualizar el ranking del usuario
      const ranking = await db.rankings.findOne({
        where: {
          usuario_id: usuario.id,
          temporada_id: temporadaActual.id,
        },
      });
      if (ranking) {
        ranking.puntos_totales += puntosGanados;
        ranking.save();
        // Actualizar todas las posiciones del ranking
        const rankings = await db.rankings.findAll({
          where: {
            temporada_id: temporadaActual.id,
          },
          order: [["puntos_totales", "DESC"]],
        });
        // Actualizar posiciones y guardar cambios
        for (let i = 0; i < rankings.length; i++) {
          rankings[i].posicion = i + 1;
          await rankings[i].save(); // Guarda cada cambio individual
        }
      } else {
        // Crear nuevo ranking
        await db.rankings.create({
          usuario_id: usuario.id,
          temporada_id: temporadaActual.id,
          puntos_totales: puntosGanados,
          posicion: 0, // se actualizará después
        });

        // Recalcular todas las posiciones después de insertar nuevo
        const rankings = await db.rankings.findAll({
          where: { temporada_id: temporadaActual.id },
          order: [["puntos_totales", "DESC"]],
        });

        for (let i = 0; i < rankings.length; i++) {
          rankings[i].posicion = i + 1;
          await rankings[i].save();
        }
      }
    }
    res.status(201).send(compra);
  } catch (error) {
    sendError500(res, error);
  }
};

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
};
