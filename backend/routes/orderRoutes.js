const express = require("express");
const router  = express.Router();
const OrderController = require("../controllers/OrderController");
const { verifyToken } = require("../middlewares/auth");
const { validate, RULES } = require("../middlewares/validateInput");

router.use(verifyToken);

router.post("/checkout", validate(RULES.checkout), OrderController.checkout.bind(OrderController));
router.get("/my",                                  OrderController.getMyOrders.bind(OrderController));

module.exports = router;
