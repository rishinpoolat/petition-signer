import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env') });

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = '24h';

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
}

const generateToken = (user) => {
    return jwt.sign(
        { 
            id: user.id, 
            email: user.email,
            role: user.role || 'petitioner'
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY }
    );
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid token');
    }
};

export { generateToken, verifyToken };