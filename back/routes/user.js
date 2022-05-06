const express = require("express");
const router = express.Router();

const userCtrl = require("../controllers/user");
const password = require("../middelware/password");
const email = require("../middelware/email");

router.post("/signup", email, password, userCtrl.signup);
router.post("/login", userCtrl.login);

module.exports = router;
