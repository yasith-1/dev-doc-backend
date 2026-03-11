const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middleware/validateMiddleware');

const registerSchema = {
    body: ['name', 'email', 'password']
};

const loginSchema = {
    body: ['email', 'password']
};

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);

module.exports = router;
