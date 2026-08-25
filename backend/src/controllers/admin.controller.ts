import type { Request, Response } from 'express';

import { AdminService } from '../services/admin.service.js';
import { HTTP_Status } from '../utils/enums/httpStatus.enum.js';
import { authAdminValidator, type AuthAdminData } from '../utils/validators/admin.validator.js';
import { zodParseData } from '../utils/helpers/zod.util.js';

export class AdminController {
  private adminService = new AdminService();

  async authAdmin(req: Request, res: Response): Promise<void> {
    const body: AuthAdminData = zodParseData(authAdminValidator, req.body);

    const result: { adminId: string } = await this.adminService.authAdmin(body);

    res.status(HTTP_Status.OK).json({ message: 'Login success.', ...result });
  }
}
