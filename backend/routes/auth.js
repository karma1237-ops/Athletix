const express        = require("express");
const router         = express.Router();
const AuthController = require("../controllers/AuthController");
const { verifyToken }        = require("../middlewares/auth");
const { validate, RULES }    = require("../middlewares/validateInput");
const { bruteForceGuard }    = require("../middlewares/bruteForce");

// bruteForceGuard doit être placé AVANT validate sur /login
// pour bloquer l'IP verrouillée avant même de valider les données
router.post("/register", validate(RULES.register), AuthController.register.bind(AuthController));
router.post("/login",    bruteForceGuard, validate(RULES.login), AuthController.login.bind(AuthController));
router.post("/refresh",                            AuthController.refresh.bind(AuthController));
router.post("/logout",   verifyToken,              AuthController.logout.bind(AuthController));
router.get ("/me",       verifyToken,              AuthController.me.bind(AuthController));

module.exports = router;
