const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.join(__dirname, '../data/db.json');

const getData = () => {
    const data = fs.readFileSync(dbPath);
    return JSON.parse(data);
};

const saveData = (data) => {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

class ProjectService {
    static getAllProjects() {
        const db = getData();
        return db.projects;
    }

    static getProjectById(id) {
        const db = getData();
        return db.projects.find(p => p.id === id);
    }

    static createProject(projectData, userId) {
        const db = getData();
        const newProject = {
            id: uuidv4(),
            ...projectData,
            requirements: '',
            documents: [],
            resourceLinks: [],
            todos: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userId
        };
        db.projects.push(newProject);
        saveData(db);
        return newProject;
    }

    static updateProject(id, updateData) {
        const db = getData();
        const index = db.projects.findIndex(p => p.id === id);
        if (index === -1) return null;

        db.projects[index] = {
            ...db.projects[index],
            ...updateData,
            updatedAt: new Date().toISOString()
        };
        saveData(db);
        return db.projects[index];
    }

    static deleteProject(id) {
        const db = getData();
        const initialLength = db.projects.length;
        db.projects = db.projects.filter(p => p.id !== id);
        if (db.projects.length === initialLength) return false;
        saveData(db);
        return true;
    }

    // Resource Link methods
    static addResourceLink(projectId, linkData) {
        const db = getData();
        const index = db.projects.findIndex(p => p.id === projectId);
        if (index === -1) return null;

        const newLink = {
            id: uuidv4(),
            ...linkData,
            addedAt: new Date().toISOString()
        };

        db.projects[index].resourceLinks.push(newLink);
        saveData(db);
        return newLink;
    }

    static deleteResourceLink(projectId, linkId) {
        const db = getData();
        const index = db.projects.findIndex(p => p.id === projectId);
        if (index === -1) return false;

        db.projects[index].resourceLinks = db.projects[index].resourceLinks.filter(l => l.id !== linkId);
        saveData(db);
        return true;
    }

    // Todo methods
    static addTodo(projectId, todoData) {
        const db = getData();
        const index = db.projects.findIndex(p => p.id === projectId);
        if (index === -1) return null;

        const newTodo = {
            id: uuidv4(),
            ...todoData,
            projectId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        db.projects[index].todos.push(newTodo);
        saveData(db);
        return newTodo;
    }

    static updateTodo(projectId, todoId, todoData) {
        const db = getData();
        const pIndex = db.projects.findIndex(p => p.id === projectId);
        if (pIndex === -1) return null;

        const tIndex = db.projects[pIndex].todos.findIndex(t => t.id === todoId);
        if (tIndex === -1) return null;

        db.projects[pIndex].todos[tIndex] = {
            ...db.projects[pIndex].todos[tIndex],
            ...todoData,
            updatedAt: new Date().toISOString()
        };
        saveData(db);
        return db.projects[pIndex].todos[tIndex];
    }

    static deleteTodo(projectId, todoId) {
        const db = getData();
        const pIndex = db.projects.findIndex(p => p.id === projectId);
        if (pIndex === -1) return false;

        db.projects[pIndex].todos = db.projects[pIndex].todos.filter(t => t.id !== todoId);
        saveData(db);
        return true;
    }

    // Document methods
    static addDocument(projectId, documentData) {
        const db = getData();
        const index = db.projects.findIndex(p => p.id === projectId);
        if (index === -1) return null;

        const newDocument = {
            id: uuidv4(),
            ...documentData,
            uploadedAt: new Date().toISOString()
        };

        if (!db.projects[index].documents) {
            db.projects[index].documents = [];
        }

        db.projects[index].documents.push(newDocument);
        saveData(db);
        return newDocument;
    }

    static deleteDocument(projectId, docId) {
        const db = getData();
        const index = db.projects.findIndex(p => p.id === projectId);
        if (index === -1) return false;

        db.projects[index].documents = db.projects[index].documents.filter(d => d.id !== docId);
        saveData(db);
        return true;
    }
}

module.exports = ProjectService;
