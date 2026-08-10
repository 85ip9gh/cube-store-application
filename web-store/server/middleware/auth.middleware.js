import jwt from 'jsonwebtoken';

export function authenticateAdmin(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
        return res.status(401).send('Missing authorization token');
    }

    try {
        jwt.verify(token, process.env.JWT_SECRET, {
            issuer: 'cube-store',
            audience: 'cube-store-admin'
        });
        next();
    } catch (err) {
        return res.status(401).send('Invalid or expired token');
    }
}
