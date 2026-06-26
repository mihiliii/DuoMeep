import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IMatchMe extends Document {
	userId: Types.ObjectId;
	description: string;
	requirements: Map<string, any>;
}

const matchMeSchema: Schema = new Schema({
	userId: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: 'User',
	},
	description: {
		type: String,
		default: '',
	},
	requirements: {
		type: Map,
		of: Schema.Types.Mixed,
		default: {},
	},
});

export const MatchMe = mongoose.model<IMatchMe>('MatchMe', matchMeSchema, 'match_me');
