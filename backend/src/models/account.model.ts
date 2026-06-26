import mongoose, { Document, Schema } from 'mongoose';

export enum GameName {
	LEAGUE_OF_LEGENDS = 'LEAGUE_OF_LEGENDS',
	VALORANT = 'VALORANT',
	TFT = 'TFT',
}

export enum Rank {
	UNRANKED = 'UNRANKED',
	BRONZE = 'BRONZE',
	SILVER = 'SILVER',
	GOLD = 'GOLD',
	PLATINUM = 'PLATINUM',
	DIAMOND = 'DIAMOND',
	MASTER = 'MASTER',
	GRANDMASTER = 'GRANDMASTER',
	CHALLENGER = 'CHALLENGER',
}

export enum Role {
	FILL = 'FILL',
	TOP = 'TOP',
	JUNGLE = 'JUNGLE',
	MID = 'MID',
	ADC = 'ADC',
	SUPPORT = 'SUPPORT',
}

export enum Region {
	NA = 'NA',
	EUW = 'EUW',
	EUNE = 'EUNE',
	KR = 'KR',
}

export interface IAccount extends Document {
	gameName: string;
	accountName: string;
	rank: string;
	role: string[] | null;
	region: string;
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
	accountName: {
		type: String,
		required: true,
		unique: true,
	},
	rank: {
		type: Rank,
		default: Rank.UNRANKED,
	},
	roles: {
		type: [Role],
		default: null,
	},
	region: {
		type: Region,
		default: null,
	},
});

export const Account = mongoose.model<IAccount>('Account', accountSchema, 'accounts');
