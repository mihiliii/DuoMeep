import argon2 from 'argon2';

import { Admin, type AdminDocument } from '../models/admin.model.js';
import { HTTP_Status } from '../utils/enums/httpStatus.enum.js';
import { AppError } from '../utils/errors/errors.js';
import type { AuthAdminData } from '../utils/validators/admin.validator.js';

export class AdminService {
  async authAdmin(body: AuthAdminData): Promise<{ adminId: string }> {
    const { username, password }: AuthAdminData = body;

    const admin: AdminDocument | null = await Admin.findOne({ username }).select('+password');

    if (!admin || !(await argon2.verify(admin.password, username + password))) {
      throw new AppError('Invalid credentials.', HTTP_Status.UNAUTHORIZED);
    }

    return { adminId: admin._id.toString() };
  }
}
