const passwordValidator = require("password-validator");

const passwordSchema = new passwordValidator();

passwordSchema
  .is()
  .min(8) // Minimum length 8
  .is()
  .max(20) // Maximum length 100
  .has()
  .uppercase() // Must have uppercase letters
  .has()
  .lowercase() // Must have lowercase letters
  .has()
  .not()
  .spaces() // Should not have spaces
  .is()
  .not()
  .oneOf(["Passw0rd", "Password123", "Azerty", "Azerty123"]); // Blacklist these values;

// Vérification de la qualité du password par rapport au schéma

module.exports = (req, res, next) => {
  console.log(passwordSchema.validate(req.body.password));
  if (passwordSchema.validate(req.body.password)) {
    return next();
  } else {
    return res.status(400).json({ error: passwordSchema.validate("req.body.password", { details: true }) });
  }
};
