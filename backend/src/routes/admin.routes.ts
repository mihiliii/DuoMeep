import express from 'express';
import { AdminController } from '../controllers/admin.controller.js';

export const adminRouter = express.Router();
const adminController = new AdminController();

adminRouter.post('/login', (req, res) => {
  return adminController.authAdmin(req, res);
});
