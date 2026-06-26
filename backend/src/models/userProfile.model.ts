import mongoose, { Document, Schema, Types } from 'mongoose';

type SiteName = string;
type SiteURL = string;

export interface IUserProfile extends Document {
	bio: string;
	tagline: string;
	games: Types.ObjectId[];
	socials: Map<SiteName, SiteURL>;
}

const userProfileSchema: Schema = new Schema({
	bio: {
		type: String,
		default: '',
	},
	tagline: {
		type: String,
		default: '',
	},
	games: {
		type: [Types.ObjectId],
		default: [],
	},
	socials: {
		type: Map,
		of: String,
		default: {},
	},
});

export const UserProfile = mongoose.model<IUserProfile>('UserProfile', userProfileSchema, 'userProfiles');
