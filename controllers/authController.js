const AuthService = require('../services/authService');

exports.register = async (req, res, next) => {
    try {
        const result = await AuthService.register(req.body);
        res.status(201).json(result);
    } catch (error) {
        if (error.message === 'User already exists') {
            res.status(400);
        }
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await AuthService.login(email, password);
        res.json(result);
    } catch (error) {
        if (error.message === 'Invalid credentials') {
            res.status(400);
        }
        next(error);
    }
};
