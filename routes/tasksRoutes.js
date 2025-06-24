const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const taskController = require("../controllers/taskController");

router.get("/", authMiddleware, taskController.getAllTasks);
router.get("/:id", authMiddleware, taskController.getTaskById);
router.post("/", authMiddleware, taskController.addTask);
router.patch("/:id", authMiddleware, taskController.updateTask);
router.delete("/:id", authMiddleware, taskController.deleteTask);

module.exports = router;




// {
//     "title": "blog 1", 
//     "description": "ok im about to get good!!!!!!!!!!!", 
//     "status": "in_progress", 
//     "dueDate": "12 sep 2025"
//   }