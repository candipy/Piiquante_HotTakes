const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");

dotenv.config();

const app = express();

const userRoutes = require("./routes/user");
const saucesRoutes = require("./routes/sauces");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many request from this IP",
});

mongoose
  .connect(process.env.MONGODB_CONNECT, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

// Erreurs CORS : bloque les appels HTTP entres serveurs différents, ici localhost:3000 et localhost: 4200
app.use((req, res, next) => {
  // Ajout de headers sur la res
  res.setHeader("Access-Control-Allow-Origin", "*"); // accès à API depuis n'import quelle origine
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  next();
});
app.use(express.json());

app.use("/images", express.static(path.join(__dirname, "images"))); // Authorise l'accès de manière statique au dossier images
app.use("/api/sauces", saucesRoutes);
app.use("/api/auth", userRoutes);
app.use(limiter);
app.use(helmet());

module.exports = app; // Permets d'utiliser les modules sur les autres fichiers
