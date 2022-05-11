// Permet de protéger les routes par l'authentification de l'utilisateur

const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1]; // Extrait le token du header Authorization de la requete entrante, en prenant tout ce qui suit l'espace (bearer )
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET); // Décoder le token
    const userId = decodedToken.userId; // Extrait de l'id utilsateur du token
    req.auth = { userId }; // Ajoute un objet auth à l'objet de requête qui contient le userId  extrait du token

    if (req.body.userId && req.body.userId !== userId) {
      // Si la requete contient un userId et qu'il est différent de l'userId contenu dans le token
      res.status(403).json({ message: "Requete non authorisée" });
    } else {
      next(); // Sinon, requete suivant
    }
  } catch {
    res.status(401).json({
      error: new Error({ error: "Requete invalide" }),
    });
  }
};
