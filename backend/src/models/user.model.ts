import mongoose, { Document, Schema, Types } from 'mongoose';

export enum UserType {
	STANDARD = 'STANDARD',
	ADMIN = 'ADMIN',
}

export interface IUser extends Document {
	username: string;
	password: string;
	email: string;
	userType: UserType;
	userDashboardId: Types.ObjectId;
}

const userSchema: Schema = new Schema({
	username: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	userType: {
		type: String,
		required: true,
		default: UserType.STANDARD,
		enum: {
			values: Object.values(UserType),
			message: '{VALUE} is not an account type!',
		},
	},
	userDashboardId: {
		type: Types.ObjectId,
		ref: 'UserDashboard',
	},
});

export const User = mongoose.model<IUser>('User', userSchema, 'users');
