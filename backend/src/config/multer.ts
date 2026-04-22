import multer from 'multer';
import path from 'path';
import type { Request } from 'express';

const destinationPath: string = './uploads/';

const diskStorage = multer.diskStorage({
	destination: destinationPath,
	filename: function (req: Request, file: Express.Multer.File, cb: (err: Error | null, fileName: string) => void) {
		cb(null, req.body.username + path.extname(file.originalname));
	},
});

export const uploadProfilePicture = multer({
	storage: diskStorage,
	limits: { fileSize: 16_000_000 },
	fileFilter: function (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
		checkFileType(file, cb);
	},
}).single('profileImage');

function checkFileType(file: Express.Multer.File, cb: multer.FileFilterCallback) {
	const validFileTypes: RegExp = /jpeg|jpg|png|gif/;
	const isValidExt: boolean = validFileTypes.test(path.extname(file.originalname).toLowerCase());
	const isValidMimeType: boolean = validFileTypes.test(file.mimetype);

	if (isValidMimeType && isValidExt) {
		return cb(null, true);
	} else {
		cb(new Error('Error: Uploaded profile picture is of invalid file type!'));
	}
}
