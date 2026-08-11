import { ObjectId } from 'mongodb';

const minutesAgo = (minutes) => new Date(Date.now() - minutes * 60000);
const idAt = (date) => ObjectId.createFromTime(Math.floor(date.getTime() / 1000));

const RANKS = [
  'UNRANKED',
  'BRONZE',
  'SILVER',
  'GOLD',
  'PLATINUM',
  'DIAMOND',
  'MASTER',
  'GRANDMASTER',
  'CHALLENGER',
];

const COLLECTIONS = {
  users: {
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
          dateCreated: { bsonType: 'date' },
        },
      },
    },
  },
  game_accounts: {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['name', 'region', 'userId'],
        properties: {
          name: { bsonType: 'string' },
          region: { bsonType: 'string', enum: ['NA', 'EUW', 'EUNE', 'KR'] },
          rank: { bsonType: 'string', enum: RANKS },
          userId: { bsonType: 'objectId' },
          status: { bsonType: 'string', enum: ['ACTIVE', 'DELETED'] },
          dateCreated: { bsonType: 'date' },
        },
      },
    },
  },
  match_me: {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['userId', 'accountId'],
        properties: {
          userId: { bsonType: 'objectId' },
          accountId: { bsonType: 'objectId' },
          roles: {
            bsonType: 'array',
            items: { bsonType: 'string', enum: ['FILL', 'TOP', 'JUNGLE', 'MID', 'BOT', 'SUPPORT'] },
            minItems: 1,
            maxItems: 2,
          },
          description: { bsonType: 'string' },
          requirements: { bsonType: 'object' },
          status: { bsonType: 'string', enum: ['ACTIVE', 'DELETED'] },
          dateCreated: { bsonType: 'date' },
        },
      },
    },
  },
  chats: {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['senderId', 'receiverId', 'message'],
        properties: {
          senderId: { bsonType: 'objectId' },
          receiverId: { bsonType: 'objectId' },
          message: { bsonType: 'string' },
          dateCreated: { bsonType: 'date' },
        },
      },
    },
  },
  reviews: {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['reviewerId', 'targetId', 'comment'],
        properties: {
          reviewerId: { bsonType: 'objectId' },
          targetId: { bsonType: 'objectId' },
          comment: { bsonType: 'string', maxLength: 2000 },
          status: { bsonType: 'string', enum: ['ACTIVE', 'DELETED'] },
          dateCreated: { bsonType: 'date' },
        },
      },
    },
  },
  admins: {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['username', 'password'],
        properties: {
          username: { bsonType: 'string' },
          password: { bsonType: 'string' },
        },
      },
    },
  },
};

/** @param {import('mongodb').Db} db */
export const up = async (db) => {
  const existing = (await db.listCollections({}, { nameOnly: true }).toArray()).map((c) => c.name);

  for (const [name, spec] of Object.entries(COLLECTIONS)) {
    if (!existing.includes(name)) {
      await db.createCollection(name, { validator: spec.validator });
    }
  }

  const userIds = {
    mihi: new ObjectId(),
    laza: new ObjectId(),
    anja: new ObjectId(),
    paja: new ObjectId(),
    ghost: new ObjectId(),
    elena: new ObjectId(),
    djole: new ObjectId(),
    zile: new ObjectId(),
    keka: new ObjectId(),
  };

  const accountIds = {
    mihi: new ObjectId(),
    laza: new ObjectId(),
    anja: new ObjectId(),
    paja: new ObjectId(),
    ghost: new ObjectId(),
    djole: new ObjectId(),
    zile: new ObjectId(),
    keka: new ObjectId(),
  };

  await db.collection('users').insertMany([
    {
      _id: userIds.mihi,
      username: 'mihi',
      avatarPath: 'uploads/avatar/mihi.jpg',
      authInfo: {
        email: 'mihi@test.com',
        password: '$argon2id$v=19$m=65536,t=3,p=4$AjaaKtrLmiBYNxLpEuxBzQ$8O8DdEmTfI7Xwd7jzlR5+ebXlakJVTwtR2PwfMm0+lo',
      },
      dashboard: {
        bio: 'bio test',
        tagline: 'tag test',
        banner: 'uploads/banner/mihi.jpg',
      },
      status: 'ACTIVE',
      dateCreated: userIds.mihi.getTimestamp(),
    },
    {
      _id: userIds.laza,
      username: 'laza',
      avatarPath: 'public/images/avatar_default.png',
      authInfo: {
        email: 'laza@test.com',
        password: '$argon2id$v=19$m=65536,t=3,p=4$5cgmn53y4uRHVF2YSpi70Q$qKmT8/p5Cq1U70miQm3ZkXlWX5r4gJa1SLr0y611sd4',
      },
      dashboard: {
        bio: 'Grinding to Diamond one game at a time.',
        tagline: 'Support main',
        banner: '',
      },
      status: 'ACTIVE',
      dateCreated: userIds.laza.getTimestamp(),
    },
    {
      _id: userIds.anja,
      username: 'anja',
      avatarPath: 'uploads/avatar/anja.png',
      authInfo: {
        email: 'anja@test.com',
        password: '$argon2id$v=19$m=65536,t=3,p=4$Iexf2oI3O8QaF9KgQV3r1w$Fea0QqGyg9L76nZhAh2vJqmyT6s8I3Q8y5L1PXejwoo',
      },
      dashboard: {
        bio: 'Jungle diff, every game.',
        tagline: 'Ex-Challenger, now casual',
        banner: '',
      },
      status: 'ACTIVE',
      dateCreated: userIds.anja.getTimestamp(),
    },
    {
      _id: userIds.paja,
      username: 'paja',
      avatarPath: 'public/images/avatar_default.png',
      authInfo: {
        email: 'paja@test.com',
        password: '$argon2id$v=19$m=65536,t=3,p=4$YAe6zu5GN4Oa+RlhSV/Waw$VZG3i1AqxJSzz3QBjbVme2nLZxbEanw5/GKwrH7kBMY',
      },
      dashboard: {
        bio: 'New to ranked, looking for patient teammates.',
        tagline: 'Unranked and unbothered',
        banner: '',
      },
      status: 'ACTIVE',
      dateCreated: userIds.paja.getTimestamp(),
    },
    {
      _id: userIds.ghost,
      username: 'ghost',
      avatarPath: 'public/images/avatar_default.png',
      authInfo: {
        email: 'ghost@test.com',
        password: '$argon2id$v=19$m=65536,t=3,p=4$Wxw1i5wHaZAg5RU9cKeVPQ$IV73O+M//Lw0v0F3TWWRTcn8qH0loXjiIxCj8UbK16Y',
      },
      dashboard: {
        bio: 'Deleted account, kept for testing soft-delete behavior.',
        tagline: '',
        banner: '',
      },
      status: 'DELETED',
      dateCreated: userIds.ghost.getTimestamp(),
    },
    {
      _id: userIds.elena,
      username: 'elena',
      avatarPath: 'uploads/avatar/elena.jpg',
      authInfo: {
        email: 'elena@test.com',
        password: '$argon2id$v=19$m=65536,t=3,p=4$YeKeCKZE6G/qqz2343oR5Q$HKB7t/ppJKjIdYsZO/Yz1tRW159OfIiM5UJXTPfQQy4',
      },
      dashboard: {
        bio: 'Just joined, no game account or matchme yet.',
        tagline: '',
        banner: '',
      },
      status: 'ACTIVE',
      dateCreated: userIds.elena.getTimestamp(),
    },
    {
      _id: userIds.djole,
      username: 'djole',
      avatarPath: 'public/images/avatar_default.png',
      authInfo: {
        email: 'djole@test.com',
        password: '$argon2id$v=19$m=65536,t=3,p=4$Ag4rcfSWNyWcRVgP3h2DIQ$KLov9m0WBoSHvXwito+u/4g2kVnuOoRU+Jn3I+WyFwg',
      },
      dashboard: {
        bio: 'Top laner, one-trick Darius.',
        tagline: 'Never surrender',
        banner: '',
      },
      status: 'ACTIVE',
      dateCreated: userIds.djole.getTimestamp(),
    },
    {
      _id: userIds.zile,
      username: 'zile',
      avatarPath: 'public/images/avatar_default.png',
      authInfo: {
        email: 'zile@test.com',
        password: '$argon2id$v=19$m=65536,t=3,p=4$Vuv3SvGzXFoVwcAYnWJgNQ$jXTT9TXOqT0onpC4ZJTes+gLVuT5rf3VJ+4kxIqlfd8',
      },
      dashboard: {
        bio: 'ADC main, climbing to Challenger.',
        tagline: 'Carry or die',
        banner: '',
      },
      status: 'ACTIVE',
      dateCreated: userIds.zile.getTimestamp(),
    },
    {
      _id: userIds.keka,
      username: 'keka',
      avatarPath: 'public/images/avatar_default.png',
      authInfo: {
        email: 'keka@test.com',
        password: '$argon2id$v=19$m=65536,t=3,p=4$w6AP5xoOmLAYJEak8bv6Mw$I0rRHSZmJHUhMFMooXU9CB17TjOxWL+hIXS9gLY6dYc',
      },
      dashboard: {
        bio: 'Casual player, mostly TFT these days.',
        tagline: 'Little legend enjoyer',
        banner: '',
      },
      status: 'ACTIVE',
      dateCreated: userIds.keka.getTimestamp(),
    },
  ]);

  await db.collection('game_accounts').insertMany([
    {
      _id: accountIds.mihi,
      name: 'Mihili#null',
      region: 'EUNE',
      rank: 'GOLD',
      userId: userIds.mihi,
      status: 'ACTIVE',
      dateCreated: accountIds.mihi.getTimestamp(),
    },
    {
      _id: accountIds.laza,
      name: 'LazaSupp#EUW1',
      region: 'EUW',
      rank: 'DIAMOND',
      userId: userIds.laza,
      status: 'ACTIVE',
      dateCreated: accountIds.laza.getTimestamp(),
    },
    {
      _id: accountIds.anja,
      name: 'AnjaJungleDiff#NA1',
      region: 'NA',
      rank: 'MASTER',
      userId: userIds.anja,
      status: 'ACTIVE',
      dateCreated: accountIds.anja.getTimestamp(),
    },
    {
      _id: accountIds.paja,
      name: 'Paja#KR01',
      region: 'KR',
      rank: 'UNRANKED',
      userId: userIds.paja,
      status: 'ACTIVE',
      dateCreated: accountIds.paja.getTimestamp(),
    },
    {
      _id: accountIds.ghost,
      name: 'GhostGone#NA1',
      region: 'NA',
      rank: 'SILVER',
      userId: userIds.ghost,
      status: 'DELETED',
      dateCreated: accountIds.ghost.getTimestamp(),
    },
    {
      _id: accountIds.djole,
      name: 'DjoleTopLane#EUW1',
      region: 'EUW',
      rank: 'PLATINUM',
      userId: userIds.djole,
      status: 'ACTIVE',
      dateCreated: accountIds.djole.getTimestamp(),
    },
    {
      _id: accountIds.zile,
      name: 'ZileCarries#KR01',
      region: 'KR',
      rank: 'GRANDMASTER',
      userId: userIds.zile,
      status: 'ACTIVE',
      dateCreated: accountIds.zile.getTimestamp(),
    },
    {
      _id: accountIds.keka,
      name: 'KekaChill#NA22',
      region: 'NA',
      rank: 'UNRANKED',
      userId: userIds.keka,
      status: 'ACTIVE',
      dateCreated: accountIds.keka.getTimestamp(),
    },
  ]);

  const matchMe = [
    {
      userId: userIds.mihi,
      accountId: accountIds.mihi,
      roles: ['MID', 'FILL'],
      description: 'Looking for a duo partner for ranked climb.',
      requirements: { minRank: 'SILVER' },
      status: 'ACTIVE',
    },
    {
      userId: userIds.laza,
      accountId: accountIds.laza,
      roles: ['SUPPORT'],
      description: 'Support main looking for a consistent BOT duo.',
      requirements: { minRank: 'PLATINUM', roles: ['BOT'] },
      status: 'ACTIVE',
    },
    {
      userId: userIds.anja,
      accountId: accountIds.anja,
      roles: ['JUNGLE', 'TOP'],
      description: 'Flexible jungle/top, coaching welcome new players too.',
      requirements: {},
      status: 'ACTIVE',
    },
    {
      userId: userIds.paja,
      accountId: accountIds.paja,
      roles: ['FILL'],
      description: 'New player, just want to learn and have fun.',
      requirements: { maxRank: 'GOLD' },
      status: 'ACTIVE',
    },
    {
      userId: userIds.ghost,
      accountId: accountIds.ghost,
      roles: ['FILL'],
      description: 'Old matchme post from a deleted account.',
      requirements: {},
      status: 'DELETED',
    },
    {
      userId: userIds.djole,
      accountId: accountIds.djole,
      roles: ['TOP'],
      description: 'One-trick Darius looking for a jungle duo to climb with.',
      requirements: { minRank: 'GOLD' },
      status: 'ACTIVE',
    },
    {
      userId: userIds.zile,
      accountId: accountIds.zile,
      roles: ['BOT'],
      description: 'ADC main grinding to Challenger, need a support duo.',
      requirements: { minRank: 'DIAMOND', roles: ['SUPPORT'] },
      status: 'ACTIVE',
    },
    {
      userId: userIds.keka,
      accountId: accountIds.keka,
      roles: ['FILL'],
      description: 'Casual player mostly into TFT, up for anything low-pressure.',
      requirements: {},
      status: 'ACTIVE',
    },
  ];

  await db.collection('match_me').insertMany(
    matchMe.map((post) => {
      const _id = new ObjectId();
      return { _id, ...post, dateCreated: _id.getTimestamp() };
    }),
  );

  const chats = [
    {
      date: minutesAgo(46),
      senderId: userIds.mihi,
      receiverId: userIds.laza,
      message: 'hey, saw your Match Me post. still looking for a duo?',
    },
    {
      date: minutesAgo(44),
      senderId: userIds.laza,
      receiverId: userIds.mihi,
      message: 'yeah! what role do you play?',
    },
    {
      date: minutesAgo(43),
      senderId: userIds.mihi,
      receiverId: userIds.laza,
      message: 'mid mostly, but I can fill jungle if you need it',
    },
    {
      date: minutesAgo(41),
      senderId: userIds.laza,
      receiverId: userIds.mihi,
      message: 'perfect, I am bot lane. queue up in 10?',
    },
    {
      date: minutesAgo(40),
      senderId: userIds.mihi,
      receiverId: userIds.laza,
      message: 'see you in queue',
    },
    {
      date: minutesAgo(180),
      senderId: userIds.anja,
      receiverId: userIds.mihi,
      message: 'gg earlier, that was a rough game',
    },
    {
      date: minutesAgo(175),
      senderId: userIds.mihi,
      receiverId: userIds.anja,
      message: 'no worries, we can run it back tomorrow',
    },
    {
      date: minutesAgo(120),
      senderId: userIds.ghost,
      receiverId: userIds.mihi,
      message: 'this message should never appear in the conversation list',
    },
    {
      date: minutesAgo(30),
      senderId: userIds.laza,
      receiverId: userIds.anja,
      message: 'are you playing tonight?',
    },
  ];

  await db.collection('chats').insertMany(
    chats.map(({ date, ...chat }) => ({ _id: idAt(date), ...chat, dateCreated: date })),
  );

  await db.collection('admins').insertOne({
    _id: new ObjectId(),
    username: 'admin',
    password: '$argon2id$v=19$m=65536,t=3,p=4$pnuX0AB7xqjhHGWgN4vaxQ$7FKZojSxzg8+ocffPNjuJ81bG8YeL7zqqCNEsb4wVoM',
  });
};

/** @param {import('mongodb').Db} db */
export const down = async (db) => {
  const existing = (await db.listCollections({}, { nameOnly: true }).toArray()).map((c) => c.name);

  for (const name of Object.keys(COLLECTIONS)) {
    if (existing.includes(name)) {
      await db.dropCollection(name);
    }
  }
};
