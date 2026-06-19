import Cube from '../Models/cube.model.js';

function buildImagePath(req) {
    return `${req.protocol}://${req.get('host')}/static/${req.file.filename}`;
}

export async function getAllCubes(req, res) {
    const cubes = await Cube.find({});
    res.json(cubes);
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

export async function getSortedCubes(req, res){
    const category = req.params.category;
    const size = req.query.size;
    const sort = req.query.sort;
    const limit = req.query.limit;
    const minPrice = req.query.minPrice;
    const maxPrice = req.query.maxPrice; 

    let filteredByCubes = await Cube.find({});

    if(category != 'All'){
        filteredByCubes = filteredByCubes.filter((cube) => !category || cube.category === category);
    }

    if(size != 'All'){
        filteredByCubes = filteredByCubes.filter((cube) => !size || cube.size === size);
    }

    
    filteredByCubes = filteredByCubes.filter((cube) => cube.price >= minPrice && cube.price <= maxPrice);
    

    let sortedCubes = filteredByCubes.sort((a, b) => {
        if (sort === 'asc') {
            return  a.title.localeCompare(b.title);
        } else {
            return  b.title.localeCompare(a.title);
        }
    });
 
    if(limit === 'All'){
        return res.send(sortedCubes);
    }

    const limitCubes = sortedCubes.slice(0, parseInt(limit, 10));

    res.send(limitCubes);
};
