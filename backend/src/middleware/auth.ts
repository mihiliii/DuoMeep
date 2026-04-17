import jwt from 'jsonwebtoken';
import { type Request, type Response, type NextFunction } from 'express';

// Extend Express Request type to include userId property
declare global {
	namespace Express {
		interface Request {
			userId?: string;
		}
	}
}

const JWT_SECRET: string = (process.env.JWT_SECRET as string) || 'DuoMeepSecretKey';

// Request will look like this:
// request.headers = { Authorization: Bearer <token> }

export default function (req: Request, res: Response, next: NextFunction) {
	const token: string | undefined = req.header('Authorization')?.split(' ')[1];

	if (!token) {
		res.status(401).json({ message: 'Access denied. No token provided.' });
		return;
	}

	try {
		const decoded: any = jwt.verify(token, JWT_SECRET);
		req.userId = decoded.userId;
		next();
	} catch (err) {
		res.status(400).json({ message: 'Invalid token.' });
	}
}
