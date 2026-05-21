import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IUser extends Document {
	username: string;
	password: string;
	email: string;
	userInfoId: Types.ObjectId;
	userDashboardId: Types.ObjectId;
}

const userSchema: Schema = new Schema({
	username: {
		type: String,
		required: true,
		unique: true,
		maxlength: 24,
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
	userInfoId: {
		type: Types.ObjectId,
		required: true,
		unique: true,
		ref: 'UserInfo',
	},
	userDashboardId: {
		type: Types.ObjectId,
		required: true,
		unique: true,
		ref: 'UserDashboard',
	},
});

export const User = mongoose.model<IUser>('User', userSchema, 'users');
