const multer = require("multer");
// Types de fichiers acceptés
const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "images"); // Indique à multer le dossier où enregistrer les fichiers => dossier images (null = 1er paramètre error)
  },
  filename: (req, file, callback) => {
    // Construit le nom du fichier
    const name = file.originalname.split(" ").join("_"); // = Nom d'origine, remplace les espaces par des _
    const extension = MIME_TYPES[file.mimetype]; // = resout l'extension
    callback(null, name + Date.now() + "." + extension); //
  },
});

// Export de l'élément multer avec la constant de stockage + .single pour indiquer que seule les fichiers images seront gérés
module.exports = multer({ storage: storage }).single("image");
