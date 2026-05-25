import mongoose, { Document, Schema, Types } from 'mongoose';

export enum ShownOnProfile {
	BIRTH_DATE = 'BIRTH_DATE',
	GENDER = 'GENDER',
	GAMES = 'GAMES',
	SOCIALS = 'SOCIALS',
}

type SiteName = string;
type SiteURL = string;

export interface IUserProfile extends Document {
	bio: string;
	tagline: string;
	games: Types.ObjectId[];
	socials: Map<SiteName, SiteURL>;
	shownOnProfile: ShownOnProfile[];
}

const userProfileSchema: Schema = new Schema({
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

export const UserProfile = mongoose.model<IUserProfile>('UserProfile', userProfileSchema, 'userProfiles');
