const Sauce = require("../models/sauces");

const fs = require("fs"); // package permettant de modifier le système de fichiers
const sauces = require("../models/sauces");
const { parse } = require("path");

// Gestion des Likes/Dislikes

exports.likesSauces = (req, res) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      // L'utilisateur n'a pas encore donné d'avis et il like
      if (!sauce.usersLiked.includes(req.body.userId) && !sauce.usersDisliked.includes(req.body.userId) && req.body.like === 1) {
        Sauce.updateOne(
          //Chercher l'objet dans la bdd
          { _id: req.params.id },
          // Mettre à jour la bdd
          { $inc: { likes: 1 }, $push: { usersLiked: req.body.userId } }
        )
          .then(() => res.status(201).json({ message: "Tu aimes cette sauce :) +1 !" }))
          .catch((error) => res.status(500).json({ error }));

        // L'utilisateur à déjà donné un like et l'enlève
      } else if (sauce.usersLiked.includes(req.body.userId) && req.body.like === 0) {
        Sauce.updateOne(
          { _id: req.params.id },

          { $inc: { likes: -1 }, $pull: { usersLiked: req.body.userId } }
        )
          .then(() => res.status(201).json({ message: "Tu aimais cette sauce, tu ne donnes plus ton avis sur cette sauce" }))

          .catch((error) => res.status(500).json({ error }));

        // L'utilisateur à déjà donné un like et il essaye d'en redonné un => conflit
      } else if (sauce.usersLiked.includes(req.body.userId) && req.body.like === 1) {
        res.status(409).json({ message: "Même si tu aimes beacoup, tu ne peux le faire qu'une fois" });

        // L'utilisateur à déjà donné un like et maintenant il dislike
      } else if (sauce.usersLiked.includes(req.body.userId) && req.body.like === -1) {
        Sauce.updateOne(
          { _id: req.params.id },

          { $inc: { likes: -1, dislikes: 1 }, $pull: { usersLiked: req.body.userId }, $push: { usersDisliked: req.body.userId } }
        )
          .then(() => res.status(201).json({ message: "Tu aimais cette sauce, tu n'aimes plus'" }))

          .catch((error) => res.status(500).json({ error }));

        // L'utilisateur n'a pas encore donné d'avis et il n'aime pas
      } else if (!sauce.usersDisliked.includes(req.body.userId) && !sauce.usersLiked.includes(req.body.userId) && req.body.like === -1) {
        Sauce.updateOne(
          { _id: req.params.id },

          { $inc: { dislikes: 1 }, $push: { usersDisliked: req.body.userId } }
        )
          .then(() => res.status(201).json({ message: "Tu n'aimes pas cette sauce :(" }))

          .catch((error) => res.status(500).json({ error }));

        // L'utilisateur a déjà donné un dislike et l'enlève
      } else if (sauce.usersDisliked.includes(req.body.userId) && req.body.like === 0) {
        Sauce.updateOne(
          { _id: req.params.id },

          { $inc: { dislikes: -1 }, $pull: { usersDisliked: req.body.userId } }
        )
          .then(() => res.status(201).json({ message: "Tu n'aimais pas cette sauce, tu ne donnes plus ton avis sur cette sauce" }))
          .catch((error) => res.status(500).json({ error }));

        // L'utilisateur a déjà donné un dislike et maintenant il like
      } else if (sauce.usersDisliked.includes(req.body.userId) && req.body.like === 1) {
        Sauce.updateOne(
          { _id: req.params.id },

          { $inc: { dislikes: -1, likes: 1 }, $pull: { usersDisliked: req.body.userId }, $push: { usersLiked: req.body.userId } }
        )
          .then(() => res.status(201).json({ message: "Tu n'aimais pas cette sauce, maintenant tu aimes" }))
          .catch((error) => res.status(500).json({ error }));

        // L'utilisateur à déjà dislike mais essaye encore une fois
      } else if (sauce.usersDisliked.includes(req.body.userId) && req.body.like === -1) {
        res.status(409).json({ message: "Même si tu n'aimes pas, tu ne peux le faire qu'une fois" });
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

// Suppression d'une sauce = DELETE

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id }) // Cherche l'objet dans la bdd
    .then((sauce) => {
      if (!sauce) {
        return res.status(404).json({ error: new Error("Objet non trouvé") });
      }
      if (sauce.userId !== req.auth.userId) {
        console.log("userID sauce", sauce.userId);
        console.log("req.userID", req.auth.userId);
        res.status(403).json({ error: new Error("Requete non authorisée") });
      } else {
        // Extraire le nom du fichier à supprimer
        const filename = sauce.imageUrl.split("/images/")[1]; // On sait qu'on a l'URL du fichier retrouné par la base, cette image aura une partie ('/images/'),
        //plit (divise) en 2 tableaux, ce qui vient avant et ce qui vient après, ce qui vient après [index1] est le nom du fichier
        fs.unlink(
          `images/${filename}`, //unlink = supprimmer un fichier, argument 1 chemin du fichier,
          () => {
            //2ème callback = ce qu'il faut faire une fois le fichier supprimé, soit supprimer la sauce
            Sauce.deleteOne({ _id: req.params.id })
              .then(() => res.status(200).json({ message: "Objet supprimé!" }))
              .catch((error) => res.status(500).json({ error }));
          }
        );
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

// Modification d'une sauce = PUT

exports.modifySauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (!sauce) {
        res.status(404).json({ error: new Error("Objet non trouvé") });
      }
      if (sauce.userId !== req.auth.userId) {
        // compare Userid de la bdb avec userId de la requete d'authentification
        res.status(403).json({ error: new Error("Requete non authorisée") });
      } else if (req.file) {
        // Si l'image est modifiée
        const filename = sauce.imageUrl.split("/images/")[1]; // On sait qu'on a l'URL du fichier retrouné par la base, cette image aura une partie ('/images/'),

        //plit (divise) en 2 tableaux, ce qui vient avant et ce qui vient après, ce qui vient après [index1] est le nom du fichier
        fs.unlink(
          `images/${filename}`, //unlink = supprimmer un fichier, argument 1 chemin du fichier,
          () => {
            const sauceObject = {
              ...JSON.parse(req.body.sauce), // Récupérer les infos de l'objet qui sont dans cette partie de la requete
              imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
            };
            if (sauceObject.likes || sauceObject.dislikes || sauceObject.usersLiked || sauceObject.usersDisliked) {
              res.status(401).json({ error: new Error("Interdiction de modifier ces champs par ici") });
            } else {
              Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                .then(() => res.status(200).json({ message: "Objet modifié" }))
                .catch((error) => res.status(500).json({ error }));
            }
          }
        );
      } else if (!req.file) {
        const sauceObject = { ...req.body };
        if (sauceObject.likes || sauceObject.dislikes || sauceObject.usersLiked || sauceObject.usersDisliked) {
          res.status(401).json({ error: new Error("Interdiction de modifier ces champs par ici") });
        } else {
          Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
            .then(() => res.status(200).json({ message: "Objet modifié" }))
            .catch((error) => res.status(500).json({ error }));
        }
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

// Création d'une sauce = POST

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce); // Extraire l'objet en Json du corps de la requete = objet utilisable

  // Création nouvelle sauce
  const sauce = new Sauce({
    ...sauceObject, // Spread = copie de tous les éléments de req.body
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`, // Résoudre URL de l'image : req.protocol = http/https, req.get('host') = URL du lien, req.filename = nom du fichier
    likes: 0, // Initilisation des données
    dislikes: 0,
    usersLiked: [""],
    usersDisliked: [""],
  });
  if (sauceObject.userId !== req.auth.userId) {
    res.status(403).json({ error: new Error("Requete non authorisée") });
  } else {
    sauce
      .save() // Enregistrer dans la base MongoDB de la nouvelle sauce
      .then(() => res.status(201).json({ message: "Objet enregistré !" }))
      .catch((error) => res.status(500).json({ error }));
    // }
  }
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id }) // cherche 1 objet dans la bdd ayant _id qui est le même que id dans le corps de la requete
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};

// Affichages de toutes les sauces : GET

exports.getAllSauces = (req, res, next) => {
  Sauce.find() // cherche toutes les sauces dans le bdd avec moongose
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => error.status(500).json({ error }));
};
