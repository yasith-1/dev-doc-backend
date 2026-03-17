const Project = require('../models/Project');

class ProjectService {
    static async getAllProjects(userId) {
        return await Project.find({ userId }).sort({ createdAt: -1 }).lean();
    }

    static async getProjectById(id) {
        return await Project.findById(id).lean();
    }

    static async createProject(projectData, userId) {
        const project = await Project.create({
            ...projectData,
            requirements: '',
            documents: [],
            resourceLinks: [],
            todos: [],
            userId
        });
        return project.toObject();
    }

    static async updateProject(id, updateData) {
        const updated = await Project.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).lean();
        return updated;
    }

    static async deleteProject(id) {
        const result = await Project.findByIdAndDelete(id);
        return !!result;
    }

    // ─── Resource Links ────────────────────────────────────────────────────────

    static async getResourceLinks(projectId) {
        const project = await Project.findById(projectId).lean();
        if (!project) return null;
        return project.resourceLinks;
    }

    static async addResourceLink(projectId, linkData) {
        const project = await Project.findByIdAndUpdate(
            projectId,
            { $push: { resourceLinks: { ...linkData, addedAt: new Date() } } },
            { new: true, runValidators: true }
        ).lean();
        if (!project) return null;
        return project.resourceLinks[project.resourceLinks.length - 1];
    }

    static async deleteResourceLink(projectId, linkId) {
        const result = await Project.findByIdAndUpdate(
            projectId,
            { $pull: { resourceLinks: { _id: linkId } } },
            { new: true }
        );
        return !!result;
    }

    // ─── Todos ─────────────────────────────────────────────────────────────────

    static async addTodo(projectId, todoData) {
        const project = await Project.findByIdAndUpdate(
            projectId,
            { $push: { todos: { ...todoData, createdAt: new Date(), updatedAt: new Date() } } },
            { new: true, runValidators: true }
        ).lean();
        if (!project) return null;
        return project.todos[project.todos.length - 1];
    }

    static async updateTodo(projectId, todoId, todoData) {
        const updateFields = {};
        for (const [key, value] of Object.entries(todoData)) {
            updateFields[`todos.$.${key}`] = value;
        }
        updateFields['todos.$.updatedAt'] = new Date();

        const project = await Project.findOneAndUpdate(
            { _id: projectId, 'todos._id': todoId },
            { $set: updateFields },
            { new: true }
        ).lean();

        if (!project) return null;
        return project.todos.find(t => t._id.toString() === todoId);
    }

    static async deleteTodo(projectId, todoId) {
        const result = await Project.findByIdAndUpdate(
            projectId,
            { $pull: { todos: { _id: todoId } } },
            { new: true }
        );
        return !!result;
    }

    // ─── Documents ─────────────────────────────────────────────────────────────

    static async addDocument(projectId, documentData) {
        const project = await Project.findByIdAndUpdate(
            projectId,
            { $push: { documents: { ...documentData, uploadedAt: new Date() } } },
            { new: true, runValidators: true }
        ).lean();
        if (!project) return null;
        return project.documents[project.documents.length - 1];
    }

    static async deleteDocument(projectId, docId) {
        const project = await Project.findById(projectId).lean();
        if (!project) return { deleted: false, doc: null };

        const doc = project.documents.find(d => d._id.toString() === docId);

        await Project.findByIdAndUpdate(
            projectId,
            { $pull: { documents: { _id: docId } } }
        );

        return { deleted: true, doc };
    }
}

module.exports = ProjectService;
