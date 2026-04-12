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

type SiteName = string;
type SiteURL = string;
type ObjectId = string;

export interface UserDashboard {
	username: string;
	email: string;
	dashboard: {
		profilePicture: string;
		bio: string;
		tagline: string;
		birthDate: Date | null;
		gender: Gender | null;
		games: ObjectId[];
		socials: Map<SiteName, SiteURL>;
		shownOnProfile: ShownOnProfile[];
	};
}
