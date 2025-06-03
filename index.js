const express = require("express");
const cors = require("cors");
const app = express();

require("dotenv").config();

// eslint-disable-next-line no-undef
const port = process.env.PORT;

const corsOptions = {
  origin: ["http://localhost:3000"],
  credentials: true,
  enablePreflight: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Leer datos del formulario
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// File Upload
const fileUpload = require("express-fileupload");
app.use(
  fileUpload({
    limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB
  })
);

// Capetas Estaticas
app.use(express.static("public"));

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    console.error(err);
    return res.sendStatus(400);
  }
  next();
});

// Base de datos
const db = require("./models");
db.sequelize.sync(/*{ force: true }*/).then(() => {
  console.log("Base de datos sincronizada");
});

// Rutas
require("./routes")(app);

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en ${port}`);
});


