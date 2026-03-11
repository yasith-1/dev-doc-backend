const ProjectService = require('../services/projectService');

exports.getProjects = (req, res, next) => {
    try {
        const projects = ProjectService.getAllProjects();
        res.json(projects);
    } catch (error) {
        next(error);
    }
};

exports.createProject = (req, res, next) => {
    try {
        const newProject = ProjectService.createProject(req.body, req.user.id);
        res.status(201).json(newProject);
    } catch (error) {
        next(error);
    }
};

exports.getProject = (req, res, next) => {
    try {
        const project = ProjectService.getProjectById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.json(project);
    } catch (error) {
        next(error);
    }
};

exports.updateProject = (req, res, next) => {
    try {
        const updatedProject = ProjectService.updateProject(req.params.id, req.body);
        if (!updatedProject) return res.status(404).json({ message: 'Project not found' });
        res.json(updatedProject);
    } catch (error) {
        next(error);
    }
};

exports.deleteProject = (req, res, next) => {
    try {
        const deleted = ProjectService.deleteProject(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Project not found' });
        res.json({ message: 'Project deleted' });
    } catch (error) {
        next(error);
    }
};

// Resource Links
exports.getResourceLinks = (req, res, next) => {
    try {
        const project = ProjectService.getProjectById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.json(project.resourceLinks);
    } catch (error) {
        next(error);
    }
};

exports.addResourceLink = (req, res, next) => {
    try {
        const newLink = ProjectService.addResourceLink(req.params.id, req.body);
        if (!newLink) return res.status(404).json({ message: 'Project not found' });
        res.status(201).json(newLink);
    } catch (error) {
        next(error);
    }
};

exports.deleteResourceLink = (req, res, next) => {
    try {
        const deleted = ProjectService.deleteResourceLink(req.params.id, req.params.linkId);
        if (!deleted) return res.status(404).json({ message: 'Project not found' });
        res.json({ message: 'Link deleted' });
    } catch (error) {
        next(error);
    }
};

// Todos
exports.addTodo = (req, res, next) => {
    try {
        const newTodo = ProjectService.addTodo(req.params.id, req.body);
        if (!newTodo) return res.status(404).json({ message: 'Project not found' });
        res.status(201).json(newTodo);
    } catch (error) {
        next(error);
    }
};

exports.updateTodo = (req, res, next) => {
    try {
        const updatedTodo = ProjectService.updateTodo(req.params.id, req.params.todoId, req.body);
        if (!updatedTodo) return res.status(404).json({ message: 'Project or Todo not found' });
        res.json(updatedTodo);
    } catch (error) {
        next(error);
    }
};

exports.deleteTodo = (req, res, next) => {
    try {
        const deleted = ProjectService.deleteTodo(req.params.id, req.params.todoId);
        if (!deleted) return res.status(404).json({ message: 'Project not found' });
        res.json({ message: 'Todo deleted' });
    } catch (error) {
        next(error);
    }
};

// Documents
exports.addDocument = (req, res, next) => {
    try {
        const newDocument = ProjectService.addDocument(req.params.id, req.body);
        if (!newDocument) return res.status(404).json({ message: 'Project not found' });
        res.status(201).json(newDocument);
    } catch (error) {
        next(error);
    }
};

exports.deleteDocument = (req, res, next) => {
    try {
        const deleted = ProjectService.deleteDocument(req.params.id, req.params.docId);
        if (!deleted) return res.status(404).json({ message: 'Project not found' });
        res.json({ message: 'Document deleted' });
    } catch (error) {
        next(error);
    }
};
