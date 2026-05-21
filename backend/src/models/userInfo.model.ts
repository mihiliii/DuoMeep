import mongoose, { Document, Schema, Types } from 'mongoose';

const defaultImagePath = 'public/images/default.png';

export enum Gender {
	MALE = 'MALE',
	FEMALE = 'FEMALE',
}

export interface IUserInfo extends Document {
	displayName: string;
	avatarPath: string;
	birthDate: Date | null;
	gender: Gender | null;
}

const userInfoSchema: Schema = new Schema({
	displayName: {
		type: String,
		required: true,
	},
	avatarPath: {
		type: String,
		required: false,
		default: defaultImagePath,
	},
	birthDate: {
		type: Date,
		required: false,
		default: null,
	},
	gender: {
		type: String,
		required: false,
		default: null,
		uppercase: true,
		enum: {
			values: Object.values(Gender),
			message: '{VALUE} is not a gender!',
		},
	},
});

export const UserInfo = mongoose.model<IUserInfo>('UserInfo', userInfoSchema, 'userInfos');
