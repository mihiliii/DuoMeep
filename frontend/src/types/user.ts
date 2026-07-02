export enum Gender {
	MALE = 'MALE',
	FEMALE = 'FEMALE',
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
	displayName: string;
	avatarPath: string;
	birthDate: Date | null;
	gender: Gender | null;
}

export interface UserProfile {
	bio: string;
	tagline: string;
	games: ObjectId[];
	socials: Record<SiteName, SiteURL>;
	shownOnProfile: ShownOnProfile[];
}

export interface UserDashboard {
	userId: string;
	userInfo: UserInfo;
	userProfile: UserProfile;
}
