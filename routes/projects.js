const express = require('express');
const router = express.Router();
const multer = require('multer');
const projectController = require('../controllers/projectController');
const auth = require('../middleware/auth');

// Multer: store files in memory (we stream straight to Supabase)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB max
    fileFilter: (req, file, cb) => {
        // Allow PDFs, images, Word docs, and common doc types
        const allowed = [
            'application/pdf',
            'image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'text/plain', 'text/csv',
            'application/zip', 'application/x-zip-compressed'
        ];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('File type not allowed'), false);
        }
    }
});

router.use(auth);

router.get('/', projectController.getProjects);
router.post('/', projectController.createProject);

// Document routes — upload (with file) comes first
router.post('/:id/documents/upload', upload.single('file'), projectController.uploadDocument);
router.post('/:id/documents', projectController.addDocument);
router.delete('/:id/documents/:docId', projectController.deleteDocument);

// Resource link routes
router.get('/:id/links', projectController.getResourceLinks);
router.post('/:id/links', projectController.addResourceLink);
router.delete('/:id/links/:linkId', projectController.deleteResourceLink);

// Todo routes
router.post('/:id/todos', projectController.addTodo);
router.put('/:id/todos/:todoId', projectController.updateTodo);
router.delete('/:id/todos/:todoId', projectController.deleteTodo);

// Basic project CRUD — keep these LAST to avoid conflicts with nested routes
router.get('/:id', projectController.getProject);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

module.exports = router;
