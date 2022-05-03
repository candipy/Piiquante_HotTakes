const express = require("express");

const router = express.Router();

const saucesCrtl = require("../controllers/sauces");

const auth = require("../middelware/auth");

const multer = require("../middelware/multer-config");

// Routes :

router.post("/:id/like", auth, saucesCrtl.likesSauces);
router.delete("/:id", auth, saucesCrtl.deleteSauce);
router.put("/:id", auth, multer, saucesCrtl.modifySauce);
router.post("/", auth, multer, saucesCrtl.createSauce);
router.get("/:id", auth, saucesCrtl.getOneSauce);
router.get("/", auth, saucesCrtl.getAllSauces);

module.exports = router;
