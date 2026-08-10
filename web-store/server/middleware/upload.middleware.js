import multer from 'multer';
import path from 'path';

const allowedImageTypes = new Map([
    ['.jpg', 'image/jpeg'],
    ['.jpeg', 'image/jpeg'],
    ['.png', 'image/png'],
    ['.webp', 'image/webp']
]);

const storage = multer.diskStorage({
    destination: 'cubes',
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const safeName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
        cb(null, `${Date.now()}-${safeName}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedImageTypes.get(ext) !== file.mimetype) {
            return cb(new Error('Only JPEG, PNG, and WebP uploads are allowed'));
        }
        cb(null, true);
    }
});

export default upload;
