import assert from 'node:assert/strict';
import test from 'node:test';
import { applyCubeQuery } from '../controllers/cube.controller.js';

const cubes = [
    { title: 'Amber', description: 'Warm glass', category: 'Glass', size: 'Small', price: 10 },
    { title: 'Cobalt', description: 'Cool metal', category: 'Metal', size: 'Large', price: 30 },
    { title: 'Basalt', description: 'Dark stone', category: 'Stone', size: 'Large', price: 20 }
];

test('returns the full catalog when optional query parameters are omitted', () => {
    const result = applyCubeQuery(cubes);

    assert.deepEqual(result.map(cube => cube.title), ['Cobalt', 'Basalt', 'Amber']);
});

test('applies category, size, price, search, sort, and limit filters', () => {
    const result = applyCubeQuery(cubes, { category: 'Metal' }, {
        size: 'Large',
        minPrice: '15',
        maxPrice: '40',
        search: 'cool',
        sort: 'asc',
        limit: '1'
    });

    assert.deepEqual(result.map(cube => cube.title), ['Cobalt']);
});

test('ignores invalid optional numeric values instead of emptying the catalog', () => {
    const result = applyCubeQuery(cubes, {}, {
        minPrice: 'not-a-number',
        maxPrice: '',
        limit: 'invalid'
    });

    assert.equal(result.length, cubes.length);
});
