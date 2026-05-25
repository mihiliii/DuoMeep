const mihiProfileId = new ObjectId();
const mihiInfoId = new ObjectId();

db.userInfos.insertOne({
	_id: mihiInfoId,
	displayName: 'Mihili',
	avatarPath: 'public/images/default.png',
	birthDate: null,
	gender: null,
});

db.userProfiles.insertOne({
	_id: mihiProfileId,
	bio: 'bio test',
	tagline: 'tag test',
	games: [],
	socials: {},
	shownOnProfile: [],
});

db.users.insertOne({
	_id: new ObjectId(),
	username: 'mihi',
	// password: Test1233
	password: '$argon2id$v=19$m=65536,t=3,p=4$3963cqi3gDvesIz5GIrROA$fH+pRT4Q5grQsyfqhhq7MhyfM9sRzM9VyaSgpdvohcg',
	email: 'mihi@test.com',
	userInfoId: mihiInfoId,
	userProfileId: mihiProfileId,
});
