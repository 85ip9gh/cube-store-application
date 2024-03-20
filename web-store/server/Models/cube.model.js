import mongoose from "mongoose";

const cubeSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imagePath: {
        type: String,
        required: true
    },
    size: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    }
});

const Cube = mongoose.model('Cube', cubeSchema);

export default Cube; 