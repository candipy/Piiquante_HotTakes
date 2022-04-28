const Sauce = require("../models/sauces");

// Modification d'une sauce = PUT

exports.modifySauce = (req, res, next) => {
  // Création d'un objet sauceObject qui regarde si req.file existe ou non
  const sauceObject = req.file
    ? {
        // Si il existe
        ...JSON.parse(req.body.sauce), // Récupérer les infos de l'objet qui sont dans cette partie de la requete
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`, // Modifier l'image URL
      }
    : { ...req.body }; // Si il n'existe pas, copie du corps de la requete
  Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id }) // modification de l'identifiant de l'objet créé
    .then(() => res.status(200).json({ message: "Objet modifié" }))
    .catch(() => res.status(400).json({ error }));
};

// Création d'une sauce = POST

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce); // Extraire l'objet en Json ddu corps de la requete = objet utilisable
  delete sauceObject._id;
  // Création nouvelle sauce
  const sauce = new Sauce({
    ...sauceObject, // Spread = copie de tous les éléments de req.body
    imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`, // Résoudre URL de l'image : req.protocol = http/https, req.get('host') = URL du lien, req.filename = nom du fichier
    likes: 0, // Initilisation des données
    dislikes: 0,
    userLiked: 0,
    userDisliked: 0,
  });
  sauce
    .save() // Enregistrer dans la base MongoDB
    .then(() => res.status(201).json({ message: "Objet enregistré !" }))
    .catch((error) => res.status(400).json({ error }));
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
    .catch((error) => error.status(400).json({ error }));
};
