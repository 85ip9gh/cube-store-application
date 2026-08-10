import Cube from '../Models/cube.model.js';

function buildImagePath(req) {
    return `${req.protocol}://${req.get('host')}/static/${req.file.filename}`;
}

export async function getAllCubes(req, res) {
    const cubes = await Cube.find({});
    res.json(cubes);
}

export async function getCubeById(req, res) {
    const cube = await Cube.findById(req.params.id);
    if (!cube) {
        return res.status(404).send('Cube not found');
    }
    res.send(cube);
}

export async function createCube(req, res) {
    if (!req.file) {
        return res.status(400).send('Image is required');
    }

    const lastCube = await Cube.findOne().sort('-id');
    const nextId = lastCube ? lastCube.id + 1 : 1;

    const newCube = new Cube({
        ...req.body,
        id: nextId,
        imagePath: buildImagePath(req)
    });
    await newCube.save();
    res.status(201).send(newCube);
}

export async function deleteCube(req, res) {
    const deletedCube = await Cube.findByIdAndDelete(req.params.id);
    if (!deletedCube) {
        return res.status(404).send('Cube not found');
    }
    res.send(deletedCube);
}

export async function deleteAllCubes(req, res) {
    await Cube.deleteMany({});
    res.send('All cubes deleted');
}

export async function updateCube(req, res) {
    const cubeId = req.params.id;
    const cube = { ...req.body };
    if (req.file) {
        cube.imagePath = buildImagePath(req);
    }
    const updatedCube = await Cube.findByIdAndUpdate
        (cubeId, cube, { new: true });
    res.send(updatedCube);
}


export async function getCubeCategories(req, res){
    let cubes = await Cube.find({});

    const uniqueCategories = cubes.map(cube => cube.category)
        .reduce((unique, item) => unique.includes(item) ? unique : [...unique, item], []);
    res.send(uniqueCategories);
};


export async function getCubeSizes(req, res){
    let cubes = await Cube.find({});

    const uniqueSizes = cubes.map(cube => cube.size)
        .reduce((unique, item) => unique.includes(item) ? unique : [...unique, item], []);
    res.send(uniqueSizes);
}

function numericBound(value, fallback) {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

export function applyCubeQuery(cubes, params = {}, query = {}) {
    const category = params.category || 'All';
    const size = query.size || 'All';
    const sort = query.sort === 'asc' ? 'asc' : 'desc';
    const minPrice = numericBound(query.minPrice, Number.NEGATIVE_INFINITY);
    const maxPrice = numericBound(query.maxPrice, Number.POSITIVE_INFINITY);
    const search = typeof query.search === 'string' ? query.search.trim().toLowerCase() : '';

    const filteredCubes = cubes.filter((cube) => {
        const matchesCategory = category === 'All' || cube.category === category;
        const matchesSize = size === 'All' || cube.size === size;
        const matchesPrice = cube.price >= minPrice && cube.price <= maxPrice;
        const matchesSearch = !search
            || cube.title.toLowerCase().includes(search)
            || cube.description.toLowerCase().includes(search);

        return matchesCategory && matchesSize && matchesPrice && matchesSearch;
    });

    const sortedCubes = filteredCubes.sort((a, b) => sort === 'asc'
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title));

    if (!query.limit || query.limit === 'All') {
        return sortedCubes;
    }

    const limit = Number.parseInt(query.limit, 10);
    return Number.isInteger(limit) && limit > 0 ? sortedCubes.slice(0, limit) : sortedCubes;
}

export async function getSortedCubes(req, res){
    const cubes = await Cube.find({});
    res.send(applyCubeQuery(cubes, req.params, req.query));
};
