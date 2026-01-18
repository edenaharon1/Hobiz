import multer from 'multer';
import path from 'path';

/**
 * Configure disk storage for uploaded files
 * Sets the destination directory and generates unique filenames
 */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../uploads'); 
        console.log(`Multer: Setting destination to ${uploadPath}`);
        cb(null, uploadPath);

    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
        console.log(`Multer: Generating filename ${filename}`);
        cb(null, filename);
    }
});

/**
 * File filter to allow only image uploads
 * 
 * @param req - Express request object
 * @param file - The file being uploaded
 * @param cb - Callback function to accept or reject the file
 */
const fileFilter = (req: any, file: any, cb: any) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image!'), false);
    }
};

/**
 * Multer upload middleware configuration
 * Handles file uploads with storage, filtering, and size limits
 */
export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    }
});

console.log("Multer configuration loaded.");