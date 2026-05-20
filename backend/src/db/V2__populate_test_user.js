const mihiDashboardId = new ObjectId();

db.userDashboards.insertOne({
	_id: mihiDashboardId,
	profilePicture: 'public/images/default.png',
	bio: 'bio test',
	tagline: 'tag test',
	birthDate: null,
	gender: null,
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
	userType: 'STANDARD',
	userDashboardId: mihiDashboardId,
});
