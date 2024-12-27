const express = require("express");
const router = express.Router();
const missionController = require("../controllers/missionController");
const { authenticateToken } = require("../middlewares/authMiddleware");

router.post("/missions", authenticateToken, missionController.createMission);

module.exports = router;
