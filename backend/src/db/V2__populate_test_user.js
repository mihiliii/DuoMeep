const mihiId = new ObjectId();
const novaId = new ObjectId();
const anjaId = new ObjectId();
const liraId = new ObjectId();
const ghostId = new ObjectId();
const elenaId = new ObjectId();

db.users.insertMany([
  {
    _id: mihiId,
    username: 'mihi',
    avatarPath: 'uploads/avatar/mihi.jpg',
    authInfo: {
      email: 'mihi@test.com',
      // password: Test1233
      password: '$argon2id$v=19$m=65536,t=3,p=4$AjaaKtrLmiBYNxLpEuxBzQ$8O8DdEmTfI7Xwd7jzlR5+ebXlakJVTwtR2PwfMm0+lo',
    },
    dashboard: {
      bio: 'bio test',
      tagline: 'tag test',
      banner: 'uploads/banner/mihi.jpg',
    },
    status: 'ACTIVE',
  },
  {
    _id: novaId,
    username: 'nova',
    avatarPath: 'public/images/avatar_default.png',
    authInfo: {
      email: 'nova@test.com',
      // password: Nova1234
      password: '$argon2id$v=19$m=65536,t=3,p=4$ATFxo5cE5ZT1Zu6X8kSQtA$HJ162HQKcSbffQWSpRHTF6hxdFRcioncr1zM07IXINU',
    },
    dashboard: {
      bio: 'Grinding to Diamond one game at a time.',
      tagline: 'Support main',
      banner: '',
    },
    status: 'ACTIVE',
  },
  {
    _id: anjaId,
    username: 'anja',
    avatarPath: 'uploads/avatar/anja.png',
    authInfo: {
      email: 'anja@test.com',
      // password: Anja1234
      password: '$argon2id$v=19$m=65536,t=3,p=4$Iexf2oI3O8QaF9KgQV3r1w$Fea0QqGyg9L76nZhAh2vJqmyT6s8I3Q8y5L1PXejwoo',
    },
    dashboard: {
      bio: 'Jungle diff, every game.',
      tagline: 'Ex-Challenger, now casual',
      banner: '',
    },
    status: 'ACTIVE',
  },
  {
    _id: liraId,
    username: 'lira',
    avatarPath: 'public/images/avatar_default.png',
    authInfo: {
      email: 'lira@test.com',
      // password: Lirara12
      password: '$argon2id$v=19$m=65536,t=3,p=4$7ouVqi4gLz2ujZ3io+Rogw$3/BmImVGp3/fpQ8jrNWAe+SYmnL3oZFpQft6J3AuSZQ',
    },
    dashboard: {
      bio: 'New to ranked, looking for patient teammates.',
      tagline: 'Unranked and unbothered',
      banner: '',
    },
    status: 'ACTIVE',
  },
  {
    _id: ghostId,
    username: 'ghost',
    avatarPath: 'public/images/avatar_default.png',
    authInfo: {
      email: 'ghost@test.com',
      // password: Ghost123
      password: '$argon2id$v=19$m=65536,t=3,p=4$Wxw1i5wHaZAg5RU9cKeVPQ$IV73O+M//Lw0v0F3TWWRTcn8qH0loXjiIxCj8UbK16Y',
    },
    dashboard: {
      bio: 'Deleted account, kept for testing soft-delete behavior.',
      tagline: '',
      banner: '',
    },
    status: 'DELETED',
  },
  {
    _id: elenaId,
    username: 'elena',
    avatarPath: 'uploads/avatar/elena.jpg',
    authInfo: {
      email: 'elena@test.com',
      // password: Elena123
      password: '$argon2id$v=19$m=65536,t=3,p=4$YeKeCKZE6G/qqz2343oR5Q$HKB7t/ppJKjIdYsZO/Yz1tRW159OfIiM5UJXTPfQQy4',
    },
    dashboard: {
      bio: 'Just joined, no game account or matchme yet.',
      tagline: '',
      banner: '',
    },
    status: 'ACTIVE',
  },
]);

const mihiAccountId = new ObjectId();
const novaAccountId = new ObjectId();
const anjaAccountId = new ObjectId();
const liraAccountId = new ObjectId();
const ghostAccountId = new ObjectId();

db.game_accounts.insertMany([
  {
    _id: mihiAccountId,
    name: 'MihiliPlays',
    region: 'EUNE',
    rank: 'GOLD',
    userId: mihiId,
    status: 'ACTIVE',
  },
  {
    _id: novaAccountId,
    name: 'NovaSupp',
    region: 'EUW',
    rank: 'DIAMOND',
    userId: novaId,
    status: 'ACTIVE',
  },
  {
    _id: anjaAccountId,
    name: 'AnjaJungleDiff',
    region: 'NA',
    rank: 'MASTER',
    userId: anjaId,
    status: 'ACTIVE',
  },
  {
    _id: liraAccountId,
    name: 'LiraLearns',
    region: 'KR',
    rank: 'UNRANKED',
    userId: liraId,
    status: 'ACTIVE',
  },
  {
    _id: ghostAccountId,
    name: 'GhostGone',
    region: 'NA',
    rank: 'SILVER',
    userId: ghostId,
    status: 'DELETED',
  },
]);

db.match_me.insertMany([
  {
    _id: new ObjectId(),
    userId: mihiId,
    accountId: mihiAccountId,
    roles: ['MID', 'FILL'],
    description: 'Looking for a duo partner for ranked climb.',
    requirements: { minRank: 'SILVER' },
    status: 'ACTIVE',
  },
  {
    _id: new ObjectId(),
    userId: novaId,
    accountId: novaAccountId,
    roles: ['SUPPORT'],
    description: 'Support main looking for a consistent BOT duo.',
    requirements: { minRank: 'PLATINUM', roles: ['BOT'] },
    status: 'ACTIVE',
  },
  {
    _id: new ObjectId(),
    userId: anjaId,
    accountId: anjaAccountId,
    roles: ['JUNGLE', 'TOP'],
    description: 'Flexible jungle/top, coaching welcome new players too.',
    requirements: {},
    status: 'ACTIVE',
  },
  {
    _id: new ObjectId(),
    userId: liraId,
    accountId: liraAccountId,
    roles: ['FILL'],
    description: 'New player, just want to learn and have fun.',
    requirements: { maxRank: 'GOLD' },
    status: 'ACTIVE',
  },
  {
    _id: new ObjectId(),
    userId: ghostId,
    accountId: ghostAccountId,
    roles: ['FILL'],
    description: 'Old matchme post from a deleted account.',
    requirements: {},
    status: 'DELETED',
  },
]);
