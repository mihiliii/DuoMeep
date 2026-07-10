const existing = db.getCollectionNames();

if (!existing.includes('users')) {
  db.createCollection('users', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['username', 'authInfo'],
        properties: {
          username: { bsonType: 'string', maxLength: 24 },
          avatarPath: { bsonType: 'string' },
          authInfo: {
            bsonType: 'object',
            required: ['email', 'password'],
            properties: {
              email: { bsonType: 'string' },
              password: { bsonType: 'string' },
            },
          },
          dashboard: {
            bsonType: 'object',
            properties: {
              bio: { bsonType: 'string' },
              tagline: { bsonType: 'string' },
              banner: { bsonType: 'string' },
            },
          },
          status: { bsonType: 'string', enum: ['ACTIVE', 'DELETED'] },
        },
      },
    },
  });
}
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ 'authInfo.email': 1 }, { unique: true });

if (!existing.includes('game_accounts')) {
  db.createCollection('game_accounts', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['name', 'region', 'userId'],
        properties: {
          name: { bsonType: 'string' },
          region: { bsonType: 'string', enum: ['NA', 'EUW', 'EUNE', 'KR'] },
          rank: {
            bsonType: 'string',
            enum: ['UNRANKED', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'MASTER', 'GRANDMASTER', 'CHALLENGER'],
          },
          userId: { bsonType: 'objectId' },
          status: { bsonType: 'string', enum: ['ACTIVE', 'DELETED'] },
        },
      },
    },
  });
}
db.game_accounts.createIndex({ name: 1 }, { unique: true });
db.game_accounts.createIndex({ userId: 1 });

if (!existing.includes('match_me')) {
  db.createCollection('match_me', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['userId'],
        properties: {
          dateCreated: { bsonType: 'date' },
          userId: { bsonType: 'objectId' },
          roles: {
            bsonType: 'array',
            items: { bsonType: 'string', enum: ['FILL', 'TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'] },
            minItems: 1,
            maxItems: 2,
          },
          description: { bsonType: 'string' },
          requirements: { bsonType: 'object' },
          status: { bsonType: 'string', enum: ['ACTIVE', 'DELETED'] },
        },
      },
    },
  });
}
db.match_me.createIndex({ userId: 1 });
