const { LogAdmin } = require("../models/mongo");

class LogsController {
  // GET /api/admin/logs?page=1&limit=50&action=
  async getLogs(req, res) {
    try {
      const page   = Math.max(1, parseInt(req.query.page)  || 1);
      const limit  = Math.min(100, parseInt(req.query.limit) || 50);
      const action = req.query.action || null;

      const filter = action ? { action: new RegExp(action, "i") } : {};

      const [logs, total] = await Promise.all([
        LogAdmin.find(filter)
          .sort({ date: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        LogAdmin.countDocuments(filter),
      ]);

      res.json({ logs, total, page, limit, pages: Math.ceil(total / limit) });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  // DELETE /api/admin/logs
  async clearLogs(req, res) {
    try {
      const result = await LogAdmin.deleteMany({});
      res.json({ message: `${result.deletedCount} log(s) supprimé(s).` });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
}

module.exports = new LogsController();
