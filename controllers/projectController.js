const ProjectService = require('../services/projectService');
const StorageService = require('../services/storageService');
const mongoose = require('mongoose');

// Guard: reject requests where :id is not a valid MongoDB ObjectId
const validateId = (id, res) => {
    if (!id || id === 'undefined' || !mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ message: `Invalid or missing project ID: "${id}"` });
        return false;
    }
    return true;
};

// Helper to serialize Mongoose IDs
const serialize = (obj) => {
    if (!obj) return obj;
    if (Array.isArray(obj)) return obj.map(serialize);
    const o = { ...obj };
    if (o._id) { o.id = o._id.toString(); delete o._id; }
    if (o.userId) o.userId = o.userId.toString();
    ['documents', 'resourceLinks', 'todos'].forEach(key => {
        if (Array.isArray(o[key])) o[key] = o[key].map(item => {
            const i = { ...item };
            if (i._id) { i.id = i._id.toString(); delete i._id; }
            return i;
        });
    });
    return o;
};

exports.getProjects = async (req, res, next) => {
    try {
        const projects = await ProjectService.getAllProjects(req.user.id);
        res.json(projects.map(serialize));
    } catch (error) {
        next(error);
    }
};

exports.createProject = async (req, res, next) => {
    try {
        const newProject = await ProjectService.createProject(req.body, req.user.id);
        res.status(201).json(serialize(newProject));
    } catch (error) {
        next(error);
    }
};

exports.getProject = async (req, res, next) => {
    if (!validateId(req.params.id, res)) return;
    try {
        const project = await ProjectService.getProjectById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.json(serialize(project));
    } catch (error) {
        next(error);
    }
};

exports.updateProject = async (req, res, next) => {
    if (!validateId(req.params.id, res)) return;
    try {
        const updatedProject = await ProjectService.updateProject(req.params.id, req.body);
        if (!updatedProject) return res.status(404).json({ message: 'Project not found' });
        res.json(serialize(updatedProject));
    } catch (error) {
        next(error);
    }
};

exports.deleteProject = async (req, res, next) => {
    if (!validateId(req.params.id, res)) return;
    try {
        const deleted = await ProjectService.deleteProject(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Project not found' });
        res.json({ message: 'Project deleted' });
    } catch (error) {
        next(error);
    }
};

// ─── Resource Links ────────────────────────────────────────────────────────────

exports.getResourceLinks = async (req, res, next) => {
    if (!validateId(req.params.id, res)) return;
    try {
        const links = await ProjectService.getResourceLinks(req.params.id);
        if (!links) return res.status(404).json({ message: 'Project not found' });
        res.json(links.map(l => ({ ...l, id: l._id?.toString() || l.id })));
    } catch (error) {
        next(error);
    }
};

exports.addResourceLink = async (req, res, next) => {
    if (!validateId(req.params.id, res)) return;
    try {
        const newLink = await ProjectService.addResourceLink(req.params.id, req.body);
        if (!newLink) return res.status(404).json({ message: 'Project not found' });
        res.status(201).json({ ...newLink, id: newLink._id?.toString() || newLink.id });
    } catch (error) {
        next(error);
    }
};

exports.deleteResourceLink = async (req, res, next) => {
    if (!validateId(req.params.id, res)) return;
    try {
        const deleted = await ProjectService.deleteResourceLink(req.params.id, req.params.linkId);
        if (!deleted) return res.status(404).json({ message: 'Link not found' });
        res.json({ message: 'Link deleted' });
    } catch (error) {
        next(error);
    }
};

// ─── Todos ─────────────────────────────────────────────────────────────────────

exports.addTodo = async (req, res, next) => {
    if (!validateId(req.params.id, res)) return;
    try {
        const newTodo = await ProjectService.addTodo(req.params.id, req.body);
        if (!newTodo) return res.status(404).json({ message: 'Project not found' });
        res.status(201).json({ ...newTodo, id: newTodo._id?.toString() || newTodo.id });
    } catch (error) {
        next(error);
    }
};

exports.updateTodo = async (req, res, next) => {
    if (!validateId(req.params.id, res)) return;
    try {
        const updatedTodo = await ProjectService.updateTodo(req.params.id, req.params.todoId, req.body);
        if (!updatedTodo) return res.status(404).json({ message: 'Todo not found' });
        res.json({ ...updatedTodo, id: updatedTodo._id?.toString() || updatedTodo.id });
    } catch (error) {
        next(error);
    }
};

exports.deleteTodo = async (req, res, next) => {
    if (!validateId(req.params.id, res)) return;
    try {
        const deleted = await ProjectService.deleteTodo(req.params.id, req.params.todoId);
        if (!deleted) return res.status(404).json({ message: 'Todo not found' });
        res.json({ message: 'Todo deleted' });
    } catch (error) {
        next(error);
    }
};

// ─── Documents ─────────────────────────────────────────────────────────────────

/**
 * Upload a real file to Supabase + save metadata to MongoDB
 * Expects multipart/form-data with: file, type
 */
exports.uploadDocument = async (req, res, next) => {
    if (!validateId(req.params.id, res)) return;
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const { buffer, originalname, mimetype, size } = req.file;
        const { type } = req.body;
        const projectId = req.params.id;
        const userId = req.user.id;

        // Upload to Supabase
        const { url, storagePath } = await StorageService.uploadFile(
            buffer,
            userId,
            projectId,
            originalname,
            mimetype
        );

        // Save metadata to MongoDB
        const newDoc = await ProjectService.addDocument(projectId, {
            name: originalname,
            type: type || 'other',
            size,
            url,
            storagePath
        });

        if (!newDoc) return res.status(404).json({ message: 'Project not found' });

        res.status(201).json({ ...newDoc, id: newDoc._id?.toString() || newDoc.id });
    } catch (error) {
        next(error);
    }
};

/**
 * Add document metadata only (no file upload) - kept for backward compat
 */
exports.addDocument = async (req, res, next) => {
    if (!validateId(req.params.id, res)) return;
    try {
        const newDocument = await ProjectService.addDocument(req.params.id, req.body);
        if (!newDocument) return res.status(404).json({ message: 'Project not found' });
        res.status(201).json({ ...newDocument, id: newDocument._id?.toString() || newDocument.id });
    } catch (error) {
        next(error);
    }
};

exports.deleteDocument = async (req, res, next) => {
    if (!validateId(req.params.id, res)) return;
    try {
        const { deleted, doc } = await ProjectService.deleteDocument(req.params.id, req.params.docId);
        if (!deleted) return res.status(404).json({ message: 'Document not found' });

        // Delete from Supabase if it has a storage path
        if (doc?.storagePath) {
            await StorageService.deleteFile(doc.storagePath);
        }

        res.json({ message: 'Document deleted' });
    } catch (error) {
        next(error);
    }
};
