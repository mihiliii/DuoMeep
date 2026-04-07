import mongoose, { Document, Schema, Types } from 'mongoose';

export enum Gender {
	MALE = 'MALE',
	FEMALE = 'FEMALE',
}

export enum UserType {
	STANDARD = 'STANDARD',
	ADMIN = 'ADMIN',
}

export enum ShownOnProfile {
	GENDER = 'GENDER',
	GAMES = 'GAMES',
	SOCIALS = 'SOCIALS',
	BIRTH_DATE = 'BIRTH_DATE',
}

type siteName = string;
type siteURL = string;

export interface IUser extends Document {
	username: string;
	password: string;
	email: string;
	userType: UserType;
	profilePicture: string | null;
	userInfo: {
		birthDate: Date | null;
		gender: Gender | null;
		details: string;
		games: Types.ObjectId[];
		socials: Map<siteName, siteURL>;
		shownOnProfile: ShownOnProfile[];
	};
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
	profilePicture: {
		type: String,
		required: false,
		default: null,
	},
	userInfo: {
		birthDate: {
			type: Date,
			required: false,
			default: null,
		},
		gender: {
			type: String,
			required: false,
			uppercase: true,
			default: null,
			enum: {
				values: Object.values(Gender),
				message: '{VALUE} is not a gender!',
			},
		},
		details: {
			type: String,
			required: false,
			default: '',
		},
		games: {
			type: [Types.ObjectId],
			required: false,
			default: [],
		},
		socials: {
			type: Map,
			of: String,
			required: false,
			default: {},
		},
		shownOnProfile: {
			type: [String],
			default: [],
			required: false,
			enum: {
				values: Object.values(ShownOnProfile),
				message: '{VALUE} is not a member of visible field!',
			},
		},
	},
});

export const User = mongoose.model<IUser>('User', userSchema, 'users');
