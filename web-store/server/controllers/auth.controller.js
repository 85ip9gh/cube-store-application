import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function login(req, res) {
    const { username, password } = req.body;

    if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD_HASH || !process.env.JWT_SECRET) {
        return res.status(503).send('Admin login is unavailable');
    }

    if (username !== process.env.ADMIN_USERNAME) {
        return res.status(401).send('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password || '', process.env.ADMIN_PASSWORD_HASH);
    if (!isMatch) {
        return res.status(401).send('Invalid credentials');
    }

    const token = jwt.sign({ username }, process.env.JWT_SECRET, {
        expiresIn: '1h',
        issuer: 'cube-store',
        audience: 'cube-store-admin'
    });
    res.json({ token });
}
