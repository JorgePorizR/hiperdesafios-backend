const db = require("../models");
const { checkRequiredFields, sendError500 } = require("../utils/request.utils");

exports.listaInsignias = async (req, res) => {
  try {
    const insignias = await db.insignias.findAll({
      order: [["id", "ASC"]],
    });
    res.status(200).send(insignias);
  } catch (error) {
    sendError500(res, error);
  }
}

exports.listaInsigniasByUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const insignias = await db.insignias_usuario.findAll({
      where: { usuario_id: id },
      include: [
        {
          model: db.insignias,
          as: "insignia",
          attributes: ["id", "nombre", "descripcion", "estado", "requirimiento", "cantidad"],
        },
        {
          model: db.temporadas,
          as: "temporada",
          attributes: ["id", "nombre"],
        },
      ],
    });
    res.status(200).send(insignias);
  } catch (error) {
    sendError500(res, error);
  }
}

exports.getInsigniaById = async (req, res) => { 
  try {
    const { id } = req.params;
    const insignia = await db.insignias.findByPk(id, {
      attributes: ["id", "nombre", "descripcion", "estado", "requirimiento", "cantidad"],
    });
    if (!insignia) {
      return res.status(404).send({ message: "Insignia no encontrada" });
    }
    res.status(200).send(insignia);
  } catch (error) {
    sendError500(res, error);
  }
}

exports.createInsignia = async (req, res) => {
  try {
    const { nombre, descripcion, requirimiento, cantidad } = req.body;
    const requiredFields = ["nombre", "descripcion", "requirimiento", "cantidad"];
    const missingFields = checkRequiredFields(requiredFields, req.body);
    
    if (missingFields.length > 0) {
      return res.status(400).send({ message: `Faltan campos requeridos: ${missingFields.join(", ")}` });
    }

    const insignia = await db.insignias.create({
      nombre,
      descripcion,
      estado: true,
      requirimiento,
      cantidad,
    });
    
    res.status(201).send(insignia);
  } catch (error) {
    sendError500(res, error);
  }
}

exports.updateInsignia = async (req, res) => {
  const { id } = req.params;
  try {
    const insignia = await db.insignias.findByPk(id);
    if (!insignia) {
      return res.status(404).send({ message: "Insignia no encontrada" });
    }

    if (req.method === "PUT") {
      const { nombre, descripcion, requirimiento, cantidad } = req.body;
      const requiredFields = ["nombre", "descripcion", "requirimiento", "cantidad"];
      const missingFields = checkRequiredFields(requiredFields, req.body);
      
      if (missingFields.length > 0) {
        return res.status(400).send({ message: `Faltan campos requeridos: ${missingFields.join(", ")}` });
      }

      insignia.nombre = nombre;
      insignia.descripcion = descripcion;
      insignia.requirimiento = requirimiento;
      insignia.cantidad = cantidad;
    }
    await insignia.save();
    res.status(200).send({
      message: "Insignia actualizada correctamente",
      insignia,
    });
  } catch (error) {
    sendError500(res, error);
  }
}

exports.deleteInsignia = async (req, res) => {
  const { id } = req.params;
  try {
    const insignia = await db.insignias.findByPk(id);
    if (!insignia) {
      return res.status(404).send({ message: "Insignia no encontrada" });
    }
    await insignia.destroy();
    res.status(200).send({ message: "Insignia eliminada correctamente" });
  } catch (error) {
    sendError500(res, error);
  }
}

exports.uploadImage = async (req, res) => {
  const id = req.params.id;
  try {
    const insignia = await db.insignias.findByPk(id);
    if (!insignia) {
      res.status(404).send({
        message: "Insignia no encontrado",
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
    await insignia.save();
    const nombreImagen = `${insignia.id}.png`;
    // eslint-disable-next-line no-undef
    imagen.mv(__dirname + `/../public/images/insignias/${nombreImagen}`);
    res.status(200).send({
      message: "Imagen subida correctamente",
      // eslint-disable-next-line no-undef
      imagen: `${process.env.BASE_URL}images/insignias/${nombreImagen}`,
    });
  } catch (error) {
    sendError500(res, error);
  }
}