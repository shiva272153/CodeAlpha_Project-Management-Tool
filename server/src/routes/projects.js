const express = require('express');
const { createProject, getProjects, getProject, deleteProject } = require('../controllers/projectController');
const { addMember, removeMember } = require('../controllers/memberController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', createProject);
router.get('/', getProjects);
router.get('/:id', getProject);
router.delete('/:id', deleteProject);
router.post('/:id/members', addMember);
router.delete('/:id/members/:userId', removeMember);

module.exports = router;
