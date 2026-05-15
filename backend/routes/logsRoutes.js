const express = require("express");
const router  = express.Router();
const LogsController = require("../controllers/LogsController");
const { verifyToken, isAdmin } = require("../middlewares/auth");

router.use(verifyToken, isAdmin);

router.get("/",        LogsController.getLogs.bind(LogsController));
router.delete("/",     LogsController.clearLogs.bind(LogsController));

module.exports = router;
