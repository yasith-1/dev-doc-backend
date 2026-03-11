const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const auth = require('../middleware/auth');

router.use(auth);

// Debug middleware for this router
router.use((req, res, next) => {
    console.log(`[DEBUG] ProjectRouter: ${req.method} ${req.url}`);
    next();
});

router.get('/', projectController.getProjects);
router.post('/', projectController.createProject);

// Highly specific routes first to avoid params conflict
router.post('/:id/documents', projectController.addDocument);
router.delete('/:id/documents/:docId', projectController.deleteDocument);

router.get('/:id/links', projectController.getResourceLinks);
router.post('/:id/links', projectController.addResourceLink);
router.delete('/:id/links/:linkId', projectController.deleteResourceLink);

router.post('/:id/todos', projectController.addTodo);
router.put('/:id/todos/:todoId', projectController.updateTodo);
router.delete('/:id/todos/:todoId', projectController.deleteTodo);

// Basic ID routes last
router.get('/:id', projectController.getProject);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

module.exports = router;
