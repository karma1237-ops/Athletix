const express = require("express");
const router  = express.Router();
const CartController = require("../controllers/CartController");
const { verifyToken } = require("../middlewares/auth");
const { validate, RULES } = require("../middlewares/validateInput");

router.use(verifyToken);

router.get("/",              CartController.getCart.bind(CartController));
router.post("/add",          validate(RULES.cartAdd), CartController.addItem.bind(CartController));
router.delete("/remove/:id", CartController.removeItem.bind(CartController));
router.delete("/",           CartController.clearCart.bind(CartController));

module.exports = router;
