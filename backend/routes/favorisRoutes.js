const express = require("express");
const router  = express.Router();
const FavorisController = require("../controllers/FavorisController");
const { verifyToken } = require("../middlewares/auth");

router.use(verifyToken);

router.get("/",              FavorisController.getFavoris.bind(FavorisController));
router.post("/add",          FavorisController.addFavori.bind(FavorisController));
router.delete("/remove/:id", FavorisController.removeFavori.bind(FavorisController));

module.exports = router;
