const db = require("../models");
const { checkRequiredFields, sendError500 } = require("../utils/request.utils");

exports.listaProductos = async (req, res) => {
  try {
    const productos = await db.productos.findAll({
      where: {
        estado: true,
      },
      order: [["id", "ASC"]],
    });
    res.status(200).send(productos);
  } catch (error) {
    sendError500(res, error);
  }
};

exports.listaProductosDestacados = async (req, res) => {
  try {
    const productos = await db.productos.findAll({
      where: {
        estado: true,
        es_destacado: true,
      },
    });
    res.status(200).send(productos);
  } catch (error) {
    sendError500(res, error);
  }
}

exports.listaProductosByCategoria = async (req, res) => {
  try {
    const { categoria } = req.params;
    const productos = await db.productos.findAll({
      where: { categoria, estado: true },
      order: [["id", "ASC"]],
    });
    res.status(200).send(productos);
  } catch (error) {
    sendError500(res, error);
  }
};

exports.listaProductosActivos = async (req, res) => {
  try {
    const productos = await db.productos.findAll({
      where: { estado: true },
      order: [["id", "ASC"]],
    });
    res.status(200).send(productos);
  } catch (error) {
    sendError500(res, error);
  }
};

exports.getProductoById = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await db.productos.findByPk(id);
    if (!producto) {
      return res.status(404).send({ message: "Producto no encontrado" });
    }
    res.status(200).send(producto);
  } catch (error) {
    sendError500(res, error);
  }
};

exports.createProducto = async (req, res) => {
  try {
    const { nombre, categoria, precio } = req.body;
    const requiredFields = ["nombre", "categoria", "precio"];
    const missingFields = checkRequiredFields(requiredFields, req.body);
    if (missingFields.length > 0) {
      return res.status(400).send({ message: `Faltan campos requeridos: ${missingFields.join(", ")}` });
    }
    const producto = await db.productos.create({
      nombre,
      categoria,
      precio,
      es_destacado: false,
      stock: 0,
      punto_extra: 0,
      estado: true,
    });
    res.status(201).send(producto);
  } catch (error) {
    sendError500(res, error);
  }
};

exports.updateProducto = async (req, res) => {
  const { id } = req.params;
  try {
    const producto = await db.productos.findByPk(id);
    if (!producto) {
      return res.status(404).send({ message: "Producto no encontrado" });
    }
    if (req.method === "PUT") {
      const requiredFields = ["nombre", "categoria", "precio", "es_destacado", "stock", "punto_extra"];
      const missingFields = checkRequiredFields(requiredFields, req.body);
      if (missingFields.length > 0) {
        return res.status(400).send({ message: `Faltan campos requeridos: ${missingFields.join(", ")}` });
      }
      req.body.estado = true;
    }
    await producto.save();
    res.status(200).send({
      message: "Producto actualizado correctamente",
      producto,
    });
  } catch (error) {
    sendError500(res, error);
  }
};

exports.deleteProducto = async (req, res) => {
  const { id } = req.params;
  try {
    const producto = await db.productos.findByPk(id);
    if (!producto) {
      return res.status(404).send({ message: "Producto no encontrado" });
    }
    await producto.destroy();
    res.status(200).send({ message: "Producto eliminado correctamente" });
  } catch (error) {
    sendError500(res, error);
  }
};

exports.uploadImage = async (req, res) => {
  const id = req.params.id;
  try {
    const producto = await db.productos.findByPk(id);
    if (!producto) {
      res.status(404).send({
        message: "Producto no encontrado",
      });
      return;
    }
    const imagen = req.files?.imagen;
    if (!imagen) {
      res.status(400).send({
        message: "No se ha enviado la imagen",
      });
      return;
    }
    await producto.save();
    const nombreImagen = `${producto.id}.png`;
    // eslint-disable-next-line no-undef
    imagen.mv(__dirname + `/../public/images/productos/${nombreImagen}`);
    res.status(200).send({
      message: "Imagen subida correctamente",
      // eslint-disable-next-line no-undef
      imagen: `${process.env.BASE_URL}images/productos/${nombreImagen}`,
    });
  } catch (error) {
    sendError500(res, error);
  }
}