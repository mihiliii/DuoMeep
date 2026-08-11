import { ObjectId } from 'mongodb';

const at = (iso) => new Date(iso);
const idAt = (date, seq) =>
  new ObjectId(Math.floor(date.getTime() / 1000).toString(16).padStart(8, '0') + seq.toString(16).padStart(16, '0'));

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
          rank: { bsonType: 'string', enum: ['UNRANKED', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'MASTER', 'GRANDMASTER', 'CHALLENGER'] },
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
    mihi: idAt(at('2026-06-06T09:15:00Z'), 1),
    laza: idAt(at('2026-06-08T14:40:00Z'), 2),
    anja: idAt(at('2026-06-11T18:05:00Z'), 3),
    paja: idAt(at('2026-06-15T11:20:00Z'), 4),
    ghost: idAt(at('2026-06-18T20:35:00Z'), 5),
    elena: idAt(at('2026-06-22T08:50:00Z'), 6),
    djole: idAt(at('2026-06-25T16:10:00Z'), 7),
    zile: idAt(at('2026-06-28T13:25:00Z'), 8),
    keka: idAt(at('2026-07-02T19:45:00Z'), 9),
  };

  const accountIds = {
    mihi: idAt(at('2026-06-06T09:30:00Z'), 1),
    laza: idAt(at('2026-06-09T10:15:00Z'), 2),
    anja: idAt(at('2026-06-12T09:40:00Z'), 3),
    paja: idAt(at('2026-06-15T11:35:00Z'), 4),
    ghost: idAt(at('2026-06-19T07:55:00Z'), 5),
    djole: idAt(at('2026-06-26T12:05:00Z'), 6),
    zile: idAt(at('2026-06-29T17:30:00Z'), 7),
    keka: idAt(at('2026-07-03T10:20:00Z'), 8),
  };

  const matchMeIds = {
    mihi: idAt(at('2026-06-07T12:00:00Z'), 1),
    laza: idAt(at('2026-06-10T09:05:00Z'), 2),
    anja: idAt(at('2026-06-13T15:45:00Z'), 3),
    paja: idAt(at('2026-06-16T08:30:00Z'), 4),
    ghost: idAt(at('2026-06-20T21:10:00Z'), 5),
    djole: idAt(at('2026-06-27T14:20:00Z'), 6),
    zile: idAt(at('2026-06-30T11:55:00Z'), 7),
    keka: idAt(at('2026-07-04T13:40:00Z'), 8),
  };

  const chatIds = {
    mihiLaza1: idAt(at('2026-07-04T17:34:00Z'), 1),
    mihiLaza2: idAt(at('2026-07-04T17:36:00Z'), 2),
    mihiLaza3: idAt(at('2026-07-04T17:37:00Z'), 3),
    mihiLaza4: idAt(at('2026-07-04T17:39:00Z'), 4),
    mihiLaza5: idAt(at('2026-07-04T17:40:00Z'), 5),
    anjaMihi1: idAt(at('2026-07-04T15:20:00Z'), 6),
    anjaMihi2: idAt(at('2026-07-04T15:25:00Z'), 7),
    ghostMihi: idAt(at('2026-07-04T16:20:00Z'), 8),
    lazaAnja: idAt(at('2026-07-04T17:50:00Z'), 9),
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
      avatarPath: 'uploads/avatar/laza.png',
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
      _id: matchMeIds.mihi,
      userId: userIds.mihi,
      accountId: accountIds.mihi,
      roles: ['MID', 'FILL'],
      description: 'Looking for a duo partner for ranked climb.',
      requirements: { minRank: 'SILVER' },
      status: 'ACTIVE',
      dateCreated: matchMeIds.mihi.getTimestamp(),
    },
    {
      _id: matchMeIds.laza,
      userId: userIds.laza,
      accountId: accountIds.laza,
      roles: ['SUPPORT'],
      description: 'Support main looking for a consistent BOT duo.',
      requirements: { minRank: 'PLATINUM', roles: ['BOT'] },
      status: 'ACTIVE',
      dateCreated: matchMeIds.laza.getTimestamp(),
    },
    {
      _id: matchMeIds.anja,
      userId: userIds.anja,
      accountId: accountIds.anja,
      roles: ['JUNGLE', 'TOP'],
      description: 'Flexible jungle/top, coaching welcome new players too.',
      requirements: {},
      status: 'ACTIVE',
      dateCreated: matchMeIds.anja.getTimestamp(),
    },
    {
      _id: matchMeIds.paja,
      userId: userIds.paja,
      accountId: accountIds.paja,
      roles: ['FILL'],
      description: 'New player, just want to learn and have fun.',
      requirements: { maxRank: 'GOLD' },
      status: 'ACTIVE',
      dateCreated: matchMeIds.paja.getTimestamp(),
    },
    {
      _id: matchMeIds.ghost,
      userId: userIds.ghost,
      accountId: accountIds.ghost,
      roles: ['FILL'],
      description: 'Old matchme post from a deleted account.',
      requirements: {},
      status: 'DELETED',
      dateCreated: matchMeIds.ghost.getTimestamp(),
    },
    {
      _id: matchMeIds.djole,
      userId: userIds.djole,
      accountId: accountIds.djole,
      roles: ['TOP'],
      description: 'One-trick Darius looking for a jungle duo to climb with.',
      requirements: { minRank: 'GOLD' },
      status: 'ACTIVE',
      dateCreated: matchMeIds.djole.getTimestamp(),
    },
    {
      _id: matchMeIds.zile,
      userId: userIds.zile,
      accountId: accountIds.zile,
      roles: ['BOT'],
      description: 'ADC main grinding to Challenger, need a support duo.',
      requirements: { minRank: 'DIAMOND', roles: ['SUPPORT'] },
      status: 'ACTIVE',
      dateCreated: matchMeIds.zile.getTimestamp(),
    },
    {
      _id: matchMeIds.keka,
      userId: userIds.keka,
      accountId: accountIds.keka,
      roles: ['FILL'],
      description: 'Casual player mostly into TFT, up for anything low-pressure.',
      requirements: {},
      status: 'ACTIVE',
      dateCreated: matchMeIds.keka.getTimestamp(),
    },
  ];

  await db.collection('match_me').insertMany(matchMe);

  const chats = [
    {
      _id: chatIds.mihiLaza1,
      senderId: userIds.mihi,
      receiverId: userIds.laza,
      message: 'hey, saw your Match Me post. still looking for a duo?',
      dateCreated: chatIds.mihiLaza1.getTimestamp(),
    },
    {
      _id: chatIds.mihiLaza2,
      senderId: userIds.laza,
      receiverId: userIds.mihi,
      message: 'yeah! what role do you play?',
      dateCreated: chatIds.mihiLaza2.getTimestamp(),
    },
    {
      _id: chatIds.mihiLaza3,
      senderId: userIds.mihi,
      receiverId: userIds.laza,
      message: 'mid mostly, but I can fill jungle if you need it',
      dateCreated: chatIds.mihiLaza3.getTimestamp(),
    },
    {
      _id: chatIds.mihiLaza4,
      senderId: userIds.laza,
      receiverId: userIds.mihi,
      message: 'perfect, I am bot lane. queue up in 10?',
      dateCreated: chatIds.mihiLaza4.getTimestamp(),
    },
    {
      _id: chatIds.mihiLaza5,
      senderId: userIds.mihi,
      receiverId: userIds.laza,
      message: 'see you in queue',
      dateCreated: chatIds.mihiLaza5.getTimestamp(),
    },
    {
      _id: chatIds.anjaMihi1,
      senderId: userIds.anja,
      receiverId: userIds.mihi,
      message: 'gg earlier, that was a rough game',
      dateCreated: chatIds.anjaMihi1.getTimestamp(),
    },
    {
      _id: chatIds.anjaMihi2,
      senderId: userIds.mihi,
      receiverId: userIds.anja,
      message: 'no worries, we can run it back tomorrow',
      dateCreated: chatIds.anjaMihi2.getTimestamp(),
    },
    {
      _id: chatIds.ghostMihi,
      senderId: userIds.ghost,
      receiverId: userIds.mihi,
      message: 'this message should never appear in the conversation list',
      dateCreated: chatIds.ghostMihi.getTimestamp(),
    },
    {
      _id: chatIds.lazaAnja,
      senderId: userIds.laza,
      receiverId: userIds.anja,
      message: 'are you playing tonight?',
      dateCreated: chatIds.lazaAnja.getTimestamp(),
    },
  ];

  await db.collection('chats').insertMany(chats);

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
