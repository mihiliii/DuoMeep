import mongoose, { Document, Schema, Types } from 'mongoose';

export enum Gender {
	MALE = 'MALE',
	FEMALE = 'FEMALE',
}

export enum ShownOnProfile {
	BIRTH_DATE = 'BIRTH_DATE',
	GENDER = 'GENDER',
	GAMES = 'GAMES',
	SOCIALS = 'SOCIALS',
}

type SiteName = string;
type SiteURL = string;

export interface IUserDashboard extends Document {
	profilePicture: string;
	bio: string;
	tagline: string;
	birthDate: Date | null;
	gender: Gender | null;
	games: Types.ObjectId[];
	socials: Map<SiteName, SiteURL>;
	shownOnProfile: ShownOnProfile[];
}

const defaultImagePath = 'public/images/default.png';

const userDashboardSchema: Schema = new Schema({
	profilePicture: {
		type: String,
		required: false,
		default: defaultImagePath,
	},
	bio: {
		type: String,
		required: false,
		default: '',
	},
	tagline: {
		type: String,
		required: false,
		default: '',
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
		required: false,
		default: [],
		enum: {
			values: Object.values(ShownOnProfile),
			message: '{VALUE} is not a member of visible field!',
		},
	},
});

export const UserDashboard = mongoose.model<IUserDashboard>(
	'UserDashboard',
	userDashboardSchema,
	'userDashboards',
);
