const User = require("../models/user");
const bcrypt = require("bcrypt"); // package de chiffrement
const jwt = require("jsonwebtoken");

exports.signup = (req, res, next) => {
  bcrypt // fonction de hachage
    .hash(req.body.password, 10) // saler 10x, soit passe l'algorithme de hachage 10 fois
    .then((hash) => {
      const user = new User({
        // Création nouvel utilisateur
        email: req.body.email,
        password: hash, // hash de son mdp
      });
      user
        .save() // Enregistre la bdd
        .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: "Utilisateur non trouvé !" });
      }
      bcrypt
        .compare(req.body.password, user.password) // compare le mdp entré par l'utilisateur avec le mdp de la bdd
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ error: "Mot de passe incorrect !" });
          }
          res.status(200).json({
            userId: user._id,
            // Création d'un token d'identification encodé (sign) qui contient l'id de l'utilisateur, puis une chaine secrete temporaire, valable 24h
            token: jwt.sign({ userId: user._id }, "RANDOM_TOKEN_SECRET", { expiresIn: "24h" }),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
