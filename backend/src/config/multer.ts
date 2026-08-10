import fs from 'fs';
import path from 'path';
import type { Request } from 'express';
import multer from 'multer';

import { HTTP_Status } from '../enums/httpStatus.enum.js';
import { AppError } from '../errors/errors.js';

function setUploadFilename(
  req: Request,
  file: Express.Multer.File,
  cb: (err: Error | null, fileName: string) => void,
): void {
  cb(null, req.params.userId + path.extname(file.originalname));
}

function checkImageFileType(invalidTypeMessage: string) {
  return function (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback): void {
    const validFileTypes: RegExp = /jpeg|jpg|png|gif/;
    const isValidExt: boolean = validFileTypes.test(path.extname(file.originalname).toLowerCase());
    const isValidMimeType: boolean = validFileTypes.test(file.mimetype);

    if (isValidMimeType && isValidExt) {
      return cb(null, true);
    } else {
      cb(new AppError(invalidTypeMessage, HTTP_Status.BAD_REQUEST));
    }
  };
}

const avatarDestinationPath: string = 'uploads/avatar/';
fs.mkdirSync(avatarDestinationPath, { recursive: true });

const avatarDiskStorage = multer.diskStorage({
  destination: avatarDestinationPath,
  filename: setUploadFilename,
});

export const uploadAvatar = multer({
  storage: avatarDiskStorage,
  limits: { fileSize: 16_000_000 },
  fileFilter: checkImageFileType('Uploaded user avatar is of invalid file type.'),
}).single('userAvatar');

const bannerDestinationPath: string = 'uploads/banner/';
fs.mkdirSync(bannerDestinationPath, { recursive: true });

const bannerDiskStorage = multer.diskStorage({
  destination: bannerDestinationPath,
  filename: setUploadFilename,
});

export const uploadBanner = multer({
  storage: bannerDiskStorage,
  limits: { fileSize: 16_000_000 },
  fileFilter: checkImageFileType('Uploaded user banner is of invalid file type.'),
}).single('userBanner');
