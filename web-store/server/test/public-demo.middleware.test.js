import assert from 'node:assert/strict';
import test from 'node:test';
import { enforcePublicReadOnly } from '../middleware/public-demo.middleware.js';

function responseRecorder() {
    return {
        statusCode: 200,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        }
    };
}

test('allows normal traffic when public read-only mode is off', () => {
    delete process.env.PUBLIC_READ_ONLY;
    let called = false;
    enforcePublicReadOnly({ method: 'POST', path: '/api/cubes' }, responseRecorder(), () => {
        called = true;
    });
    assert.equal(called, true);
});

test('allows reads in public read-only mode', () => {
    process.env.PUBLIC_READ_ONLY = 'true';
    let called = false;
    enforcePublicReadOnly({ method: 'GET', path: '/api/cubes' }, responseRecorder(), () => {
        called = true;
    });
    assert.equal(called, true);
});

test('blocks mutations in public read-only mode', () => {
    process.env.PUBLIC_READ_ONLY = 'true';
    const response = responseRecorder();
    enforcePublicReadOnly({ method: 'DELETE', path: '/api/cubes/1' }, response, () => {});
    assert.equal(response.statusCode, 403);
    assert.equal(response.body.error, 'This public demo is read-only.');
});

test('keeps checkout unavailable in public read-only mode', () => {
    process.env.PUBLIC_READ_ONLY = 'true';
    const response = responseRecorder();
    enforcePublicReadOnly({ method: 'POST', path: '/checkout' }, response, () => {});
    assert.equal(response.statusCode, 503);
    assert.equal(response.body.error, 'Checkout is disabled for this public demo.');
});

test('hides admin login in public read-only mode', () => {
    process.env.PUBLIC_READ_ONLY = 'true';
    const response = responseRecorder();
    enforcePublicReadOnly({ method: 'POST', path: '/api/auth/login' }, response, () => {});
    assert.equal(response.statusCode, 404);
});
