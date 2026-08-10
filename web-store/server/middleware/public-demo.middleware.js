export function enforcePublicReadOnly(req, res, next) {
    if (process.env.PUBLIC_READ_ONLY !== 'true') {
        return next();
    }

    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }

    if (req.path === '/checkout') {
        return res.status(503).json({ error: 'Checkout is disabled for this public demo.' });
    }

    if (req.path.startsWith('/api/auth')) {
        return res.status(404).json({ error: 'Not found.' });
    }

    return res.status(403).json({ error: 'This public demo is read-only.' });
}
