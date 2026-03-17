const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: {
        type: String,
        enum: ['srs', 'erd', 'usecase', 'uiux', 'other'],
        default: 'other'
    },
    size: { type: Number, default: 0 },
    url: { type: String, default: '' },          // Supabase public URL
    storagePath: { type: String, default: '' },   // Path within Supabase bucket
    uploadedAt: { type: Date, default: Date.now }
});

const resourceLinkSchema = new mongoose.Schema({
    url: { type: String, required: true },
    label: { type: String, default: '' },
    description: { type: String, default: '' },
    addedAt: { type: Date, default: Date.now }
});

const todoSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: '' },
    completed: { type: Boolean, default: false },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    dueDate: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const projectSchema = new mongoose.Schema({
    name: { type: String, required: [true, 'Project name is required'], trim: true },
    clientName: { type: String, default: '', trim: true },
    deadline: { type: Date },
    tags: [{ type: String }],
    requirements: { type: String, default: '' },
    documents: [documentSchema],
    resourceLinks: [resourceLinkSchema],
    todos: [todoSchema],
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);
