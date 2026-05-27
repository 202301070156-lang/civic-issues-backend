const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ================= CREATE UPLOADS FOLDER =================
const uploadPath = 'uploads/';

if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath);
}

// ================= STORAGE =================
const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, uploadPath);
    },

    filename: (req, file, cb) => {

        const uniqueName =
            Date.now() +
            '-' +
            file.originalname.replace(/\s+/g, '_');

        cb(null, uniqueName);
    }
});

// ================= FILE FILTER =================
const fileFilter = (req, file, cb) => {

    const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png'
    ];

    if (allowedTypes.includes(file.mimetype)) {

        cb(null, true);

    } else {

        cb(
            new Error(
                'Only JPG JPEG PNG allowed'
            ),
            false
        );
    }
};

// ================= MULTER =================
const upload = multer({

    storage,

    fileFilter,

    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

module.exports = upload;