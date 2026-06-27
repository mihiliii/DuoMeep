// Member NAMES mirror backend/src/models/account.model.ts; VALUES are title-cased
// for display, so they differ from the backend's UPPERCASE values (e.g. GOLD = 'Gold').

export enum GameName {
	LEAGUE_OF_LEGENDS = 'LEAGUE_OF_LEGENDS',
	VALORANT = 'VALORANT',
	TFT = 'TFT',
}

export enum Rank {
	UNRANKED = 'Unranked',
	BRONZE = 'Bronze',
	SILVER = 'Silver',
	GOLD = 'Gold',
	PLATINUM = 'Platinum',
	DIAMOND = 'Diamond',
	MASTER = 'Master',
	GRANDMASTER = 'Grandmaster',
	CHALLENGER = 'Challenger',
}

export enum Role {
	FILL = 'Fill',
	TOP = 'Top',
	JUNGLE = 'Jungle',
	MID = 'Mid',
	ADC = 'Bot',
	SUPPORT = 'Support',
}

export enum Region {
	NA = 'NA',
	EUW = 'EUW',
	EUNE = 'EUNE',
	KR = 'KR',
}
