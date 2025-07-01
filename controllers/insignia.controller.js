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
    
    // Usar la relación directa para obtener información completa
    const insigniasUsuario = await db.insignias_usuario.findAll({
      where: { usuario_id: id },
      include: [
        {
          model: db.insignias,
          as: "insignia",
          attributes: ["id", "nombre", "descripcion", "estado", "requirimiento", "cantidad", "imagenUrl"],
        },
        {
          model: db.temporadas,
          as: "temporada",
          attributes: ["id", "nombre", "estado"],
        }
      ],
      attributes: ["id", "fecha_obtencion"],
      order: [["fecha_obtencion", "DESC"]],
    });
    
    if (!insigniasUsuario || insigniasUsuario.length === 0) {
      res.status(200).send([]);
      return;
    }

    // Formatear la respuesta usando map (funcional)
    const insigniasFormateadas = insigniasUsuario.map(item => ({
      ...item.insignia.toJSON(),
      fecha_obtencion: item.fecha_obtencion,
      temporada: item.temporada,
      insignia_usuario_id: item.id
    }));

    res.status(200).send(insigniasFormateadas);
  } catch (error) {
    sendError500(res, error);
  }
}

exports.getInsigniaById = async (req, res) => { 
  try {
    const { id } = req.params;
    const insignia = await db.insignias.findByPk(id, {
      attributes: ["id", "nombre", "descripcion", "estado", "requirimiento", "cantidad", "imagenUrl"],
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

exports.asignarInsignia = async (req, res) => {
  try {
    const { usuario_id, insignia_id, temporada_id } = req.body;
    const requiredFields = ["usuario_id", "insignia_id", "temporada_id"];
    const missingFields = checkRequiredFields(requiredFields, req.body);
    
    if (missingFields.length > 0) {
      return res.status(400).send({ message: `Faltan campos requeridos: ${missingFields.join(", ")}` });
    }

    // Verificar que el usuario existe
    const usuario = await db.usuarios.findByPk(usuario_id);
    if (!usuario) {
      return res.status(404).send({ message: "Usuario no encontrado" });
    }

    // Verificar que la insignia existe
    const insignia = await db.insignias.findByPk(insignia_id);
    if (!insignia) {
      return res.status(404).send({ message: "Insignia no encontrada" });
    }

    // Verificar que la temporada existe
    const temporada = await db.temporadas.findByPk(temporada_id);
    if (!temporada) {
      return res.status(404).send({ message: "Temporada no encontrada" });
    }

    // Verificar si ya tiene esta insignia en esta temporada
    const insigniaExistente = await db.insignias_usuario.findOne({
      where: {
        usuario_id,
        insignia_id,
        temporada_id
      }
    });

    if (insigniaExistente) {
      return res.status(400).send({ message: "El usuario ya tiene esta insignia en esta temporada" });
    }

    // Asignar la insignia
    const insigniaUsuario = await db.insignias_usuario.create({
      usuario_id,
      insignia_id,
      temporada_id,
      fecha_obtencion: new Date()
    });

    res.status(201).send({
      message: "Insignia asignada correctamente",
      insignia_usuario: insigniaUsuario
    });
  } catch (error) {
    sendError500(res, error);
  }
}

exports.removerInsignia = async (req, res) => {
  try {
    const { id } = req.params; // ID de la relación insignia_usuario
    
    const insigniaUsuario = await db.insignias_usuario.findByPk(id);
    if (!insigniaUsuario) {
      return res.status(404).send({ message: "Relación insignia-usuario no encontrada" });
    }

    await insigniaUsuario.destroy();
    res.status(200).send({ message: "Insignia removida correctamente" });
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