const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthService {
    static async register(userData) {
        const { name, email, password } = userData;

        const userExists = await User.findOne({ email });
        if (userExists) {
            throw new Error('User already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword
        });

        const token = this.generateToken(newUser._id.toString());

        return {
            token,
            user: {
                id: newUser._id.toString(),
                name: newUser.name,
                email: newUser.email
            }
        };
    }

    static async login(email, password) {
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        const token = this.generateToken(user._id.toString());

        return {
            token,
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email
            }
        };
    }

    static generateToken(id) {
        return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    }
}

module.exports = AuthService;
