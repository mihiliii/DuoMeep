const existing = db.getCollectionNames();

if (!existing.includes('users')) {
	db.createCollection('users', {
		validator: {
			$jsonSchema: {
				bsonType: 'object',
				required: ['username', 'password', 'email', 'userInfoId', 'userProfileId'],
				properties: {
					username: { bsonType: 'string', maxLength: 24 },
					password: { bsonType: 'string', pattern: '^(?=.*[A-Z])(?=.*\\d).{8,}$' },
					email: { bsonType: 'string' },
					userInfoId: { bsonType: 'objectId' },
					userProfileId: { bsonType: 'objectId' },
				},
			},
		},
	});
}
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { unique: true });

if (!existing.includes('accounts')) {
	db.createCollection('accounts', {
		validator: {
			$jsonSchema: {
				bsonType: 'object',
				required: ['gameName', 'puuid'],
				properties: {
					gameName: { bsonType: 'string', enum: ['LEAGUE_OF_LEGENDS', 'VALORANT', 'TFT'] },
					puuid: { bsonType: 'string' },
				},
			},
		},
	});
}
db.accounts.createIndex({ puuid: 1 }, { unique: true });

if (!existing.includes('match_me')) db.createCollection('match_me');

if (!existing.includes('userProfiles')) {
	db.createCollection('userProfiles', {
		validator: {
			$jsonSchema: {
				bsonType: 'object',
				properties: {
					bio: { bsonType: 'string' },
					tagline: { bsonType: 'string' },
					games: { bsonType: 'array', items: { bsonType: 'objectId' } },
					socials: { bsonType: 'object' },
					shownOnProfile: {
						bsonType: 'array',
						items: { bsonType: 'string', enum: ['BIRTH_DATE', 'GENDER', 'GAMES', 'SOCIALS'] },
					},
				},
			},
		},
	});
}

if (!existing.includes('userInfos')) {
	db.createCollection('userInfos', {
		validator: {
			$jsonSchema: {
				bsonType: 'object',
				required: ['displayName'],
				properties: {
					displayName: { bsonType: 'string' },
					avatarPath: { bsonType: 'string' },
					birthDate: { bsonType: ['date', 'null'] },
					gender: { enum: ['MALE', 'FEMALE', null] },
				},
			},
		},
	});
}
