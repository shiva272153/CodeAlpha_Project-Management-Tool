const express = require('express');
const { createTask, updateTask, moveTask, deleteTask } = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', createTask);
router.put('/:id', updateTask);
router.put('/:id/move', moveTask);
router.delete('/:id', deleteTask);

module.exports = router;
