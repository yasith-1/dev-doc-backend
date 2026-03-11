const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.join(__dirname, '../data/db.json');

const getData = () => {
    const data = fs.readFileSync(dbPath);
    return JSON.parse(data);
};

const saveData = (data) => {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

class AuthService {
    static async register(userData) {
        const { name, email, password } = userData;
        const db = getData();

        const userExists = db.users.find(u => u.email === email);
        if (userExists) {
            throw new Error('User already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            id: uuidv4(),
            name,
            email,
            password: hashedPassword
        };

        db.users.push(newUser);
        saveData(db);

        const token = this.generateToken(newUser.id);

        return {
            token,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email
            }
        };
    }

    static async login(email, password) {
        const db = getData();

        const user = db.users.find(u => u.email === email);
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        const token = this.generateToken(user.id);

        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        };
    }

    static generateToken(id) {
        return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    }
}

module.exports = AuthService;
