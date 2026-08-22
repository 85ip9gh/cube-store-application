export function enforcePublicReadOnly(req, res, next) {
    if (process.env.PUBLIC_READ_ONLY !== 'true') {
        return next();
    }

    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }

    // Checkout is the one non-GET path a public demo may expose, and only when
    // it is deliberately switched on. It is safe to expose because it writes
    // nothing: the controller reads cube records and hands Stripe a session,
    // with prices taken from the database rather than from the request.
    if (req.path === '/checkout') {
        if (process.env.CHECKOUT_ENABLED === 'true') {
            return next();
        }
        return res.status(503).json({ error: 'Checkout is disabled for this public demo.' });
    }

    if (req.path.startsWith('/api/auth')) {
        return res.status(404).json({ error: 'Not found.' });
    }

    return res.status(403).json({ error: 'This public demo is read-only.' });
}
