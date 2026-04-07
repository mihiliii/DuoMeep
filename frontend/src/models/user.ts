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

export interface UserInfo {
	username: string;
	password: string;
	email: string;
	userType: UserType;
	profilePicture: string | null;
	userInfo: {
		birthDate: Date | null;
		gender: Gender | null;
		details: string;
		games: ObjectId[];
		socials: Map<SiteName, SiteURL>;
		shownOnProfile: ShownOnProfile[];
	};
}
