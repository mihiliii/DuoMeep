import mongoose, { Document, Schema } from 'mongoose';

export enum GameName {
	LEAGUE_OF_LEGENDS = 'LEAGUE_OF_LEGENDS',
	VALORANT = 'VALORANT',
	TFT = 'TFT',
}

export interface IAccount extends Document {
	gameName: string;
	puuid: string;
}

export const accountSchema: Schema = new Schema({
	gameName: {
		type: String,
		required: true,
		enum: {
			values: Object.values(GameName),
			message: '{VALUE} is not a valid game name!',
		},
	},
	puuid: {
		type: String,
		required: true,
		unique: true,
	},
});

export const Account = mongoose.model<IAccount>('Account', accountSchema, 'accounts');
