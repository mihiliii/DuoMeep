import { ObjectId } from 'mongodb';

const at = (iso) => new Date(iso);
const idAt = (date, seq) =>
  new ObjectId(
    Math.floor(date.getTime() / 1000)
      .toString(16)
      .padStart(8, '0') + seq.toString(16).padStart(16, '0'),
  );

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
          bio: { bsonType: 'string' },
          tagline: { bsonType: 'string' },
          banner: { bsonType: 'string' },
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
          rank: {
            bsonType: 'string',
            enum: [
              'UNRANKED',
              'IRON',
              'BRONZE',
              'SILVER',
              'GOLD',
              'PLATINUM',
              'EMERALD',
              'DIAMOND',
              'MASTER',
              'GRANDMASTER',
              'CHALLENGER',
            ],
          },
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
    mihiDjole1: idAt(at('2026-07-05T10:05:00Z'), 10),
    mihiDjole2: idAt(at('2026-07-05T10:07:00Z'), 11),
    mihiDjole3: idAt(at('2026-07-05T10:12:00Z'), 12),
    mihiDjole4: idAt(at('2026-07-05T10:15:00Z'), 13),
    mihiElena1: idAt(at('2026-07-05T19:20:00Z'), 14),
    mihiElena2: idAt(at('2026-07-05T19:26:00Z'), 15),
    lazaKeka1: idAt(at('2026-07-06T13:10:00Z'), 16),
    lazaKeka2: idAt(at('2026-07-06T13:14:00Z'), 17),
    lazaKeka3: idAt(at('2026-07-06T13:18:00Z'), 18),
    anjaZile1: idAt(at('2026-07-06T21:02:00Z'), 19),
    anjaZile2: idAt(at('2026-07-06T21:09:00Z'), 20),
  };

  const reviewIds = {
    lazaOnMihi: idAt(at('2026-07-05T11:00:00Z'), 1),
    anjaOnMihi: idAt(at('2026-07-06T16:30:00Z'), 2),
    djoleOnMihi: idAt(at('2026-07-08T09:15:00Z'), 3),
    zileOnMihi: idAt(at('2026-07-10T20:45:00Z'), 4),
    kekaOnMihi: idAt(at('2026-07-12T14:05:00Z'), 5),
    elenaOnMihi: idAt(at('2026-07-14T18:50:00Z'), 6),
    pajaOnMihi: idAt(at('2026-07-15T12:25:00Z'), 7),
    mihiOnLaza: idAt(at('2026-07-05T11:30:00Z'), 8),
    anjaOnLaza: idAt(at('2026-07-07T10:40:00Z'), 9),
    kekaOnLaza: idAt(at('2026-07-11T17:15:00Z'), 10),
    mihiOnAnja: idAt(at('2026-07-06T18:00:00Z'), 11),
    lazaOnAnja: idAt(at('2026-07-09T13:35:00Z'), 12),
    mihiOnDjole: idAt(at('2026-07-13T15:20:00Z'), 13),
    zileOnDjole: idAt(at('2026-07-16T19:10:00Z'), 14),
    djoleOnZile: idAt(at('2026-07-18T11:45:00Z'), 15),
  };

  await db.collection('users').insertMany([
    {
      _id: userIds.mihi,
      username: 'mihi',
      avatarPath: 'uploads/avatar/mihi.jpg',
      authInfo: {
        email: 'mihi@test.com',
        password: '$argon2id$v=19$m=65536,t=3,p=4$JYg8FN0hpbxjMNTOUXegow$+Rzcthnb9oBFsFZBWLUBb2J8QqAQL3ML1j9/jojsQSQ',
      },
      bio: 'bio test',
      tagline: 'tag test',
      banner: 'uploads/banner/mihi.jpg',
      status: 'ACTIVE',
      dateCreated: userIds.mihi.getTimestamp(),
    },
    {
      _id: userIds.laza,
      username: 'laza',
      avatarPath: 'uploads/avatar/laza.png',
      authInfo: {
        email: 'laza@test.com',
        password: '$argon2id$v=19$m=65536,t=3,p=4$Y61rm2SX2wZCz9b9AT72zw$Bld01+QcZ666xhdTKn94XP/zi96BTGei/9aSqhiiR88',
      },
      bio: 'Grinding to Diamond one game at a time.',
      tagline: 'Support main',
      banner: '',
      status: 'ACTIVE',
      dateCreated: userIds.laza.getTimestamp(),
    },
    {
      _id: userIds.anja,
      username: 'anja',
      avatarPath: 'uploads/avatar/anja.png',
      authInfo: {
        email: 'anja@test.com',
        password: '$argon2id$v=19$m=65536,t=3,p=4$qHpcjHbYExcaRJ+fsNQFHQ$8+t3YIUXOzpAt9QGI6gdLZwtzL7JEK1SgJi/pYKVDjs',
      },
      bio: 'Jungle diff, every game.',
      tagline: 'Ex-Challenger, now casual',
      banner: '',
      status: 'ACTIVE',
      dateCreated: userIds.anja.getTimestamp(),
    },
    {
      _id: userIds.paja,
      username: 'paja',
      avatarPath: 'public/images/avatar_default.png',
      authInfo: {
        email: 'paja@test.com',
        password: '$argon2id$v=19$m=65536,t=3,p=4$THvKSFiO7Rkw5fZ3oWBUZg$wBYwrwj3m992Mxh5GbI/lKooq3S9KqzKweqmfAAzBWk',
      },
      bio: 'New to ranked, looking for patient teammates.',
      tagline: 'Unranked and unbothered',
      banner: '',
      status: 'ACTIVE',
      dateCreated: userIds.paja.getTimestamp(),
    },
    {
      _id: userIds.ghost,
      username: 'ghost',
      avatarPath: 'public/images/avatar_default.png',
      authInfo: {
        email: 'ghost@test.com',
        password: '$argon2id$v=19$m=65536,t=3,p=4$1Ik6olgsz9WjdqWfQ+qD5w$RLMcadikUbLEAPZJpXcdsE4/FBpcXxMQ/j2zfW58WLQ',
      },
      bio: 'Deleted account, kept for testing soft-delete behavior.',
      tagline: '',
      banner: '',
      status: 'DELETED',
      dateCreated: userIds.ghost.getTimestamp(),
    },
    {
      _id: userIds.elena,
      username: 'elena',
      avatarPath: 'uploads/avatar/elena.jpg',
      authInfo: {
        email: 'elena@test.com',
        password: '$argon2id$v=19$m=65536,t=3,p=4$F79dHTGiSY1PtjN4Zo/e1g$tOKDpUpWl9OZ69OpaJ5Wu+x0GvznTXkgcH6FBGceXrk',
      },
      bio: 'Just joined, no game account or matchme yet.',
      tagline: '',
      banner: '',
      status: 'ACTIVE',
      dateCreated: userIds.elena.getTimestamp(),
    },
    {
      _id: userIds.djole,
      username: 'djole',
      avatarPath: 'public/images/avatar_default.png',
      authInfo: {
        email: 'djole@test.com',
        password: '$argon2id$v=19$m=65536,t=3,p=4$1dXJs2tBGkJ1eDgvfmTq9g$J/1amTfx8Nj/OHZmF0dT3eO4/r/+OhJ+2zmhvULECjo',
      },
      bio: 'Top laner, one-trick Darius.',
      tagline: 'Never surrender',
      banner: '',
      status: 'ACTIVE',
      dateCreated: userIds.djole.getTimestamp(),
    },
    {
      _id: userIds.zile,
      username: 'zile',
      avatarPath: 'public/images/avatar_default.png',
      authInfo: {
        email: 'zile@test.com',
        password: '$argon2id$v=19$m=65536,t=3,p=4$pxRGhex/JE4t+Qi0e80VRQ$yhJijsDPimFt88nfkJ5WgwFQy5/6LC1pNw/xhfvgDGA',
      },
      bio: 'ADC main, climbing to Challenger.',
      tagline: 'Carry or die',
      banner: '',
      status: 'ACTIVE',
      dateCreated: userIds.zile.getTimestamp(),
    },
    {
      _id: userIds.keka,
      username: 'keka',
      avatarPath: 'public/images/avatar_default.png',
      authInfo: {
        email: 'keka@test.com',
        password: '$argon2id$v=19$m=65536,t=3,p=4$21lnmR4xNqPCyYqz6UFoZw$+MdXtLNr3tD/nLC8lYEG5aqOZRRdB9dW/iG0gNhrAOU',
      },
      bio: 'Casual player, mostly TFT these days.',
      tagline: 'Little legend enjoyer',
      banner: '',
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
    {
      _id: chatIds.mihiDjole1,
      senderId: userIds.djole,
      receiverId: userIds.mihi,
      message: 'saw you play mid, are you climbing this split?',
      dateCreated: chatIds.mihiDjole1.getTimestamp(),
    },
    {
      _id: chatIds.mihiDjole2,
      senderId: userIds.mihi,
      receiverId: userIds.djole,
      message: 'trying to, stuck in promos for a week now',
      dateCreated: chatIds.mihiDjole2.getTimestamp(),
    },
    {
      _id: chatIds.mihiDjole3,
      senderId: userIds.djole,
      receiverId: userIds.mihi,
      message: 'I can jungle for you if you want, I know the matchup',
      dateCreated: chatIds.mihiDjole3.getTimestamp(),
    },
    {
      _id: chatIds.mihiDjole4,
      senderId: userIds.mihi,
      receiverId: userIds.djole,
      message: 'that would help a lot, add me in client',
      dateCreated: chatIds.mihiDjole4.getTimestamp(),
    },
    {
      _id: chatIds.mihiElena1,
      senderId: userIds.elena,
      receiverId: userIds.mihi,
      message: 'is your Match Me post still open?',
      dateCreated: chatIds.mihiElena1.getTimestamp(),
    },
    {
      _id: chatIds.mihiElena2,
      senderId: userIds.mihi,
      receiverId: userIds.elena,
      message: 'it is, what region do you play on?',
      dateCreated: chatIds.mihiElena2.getTimestamp(),
    },
    {
      _id: chatIds.lazaKeka1,
      senderId: userIds.keka,
      receiverId: userIds.laza,
      message: 'we queued together last night, good games',
      dateCreated: chatIds.lazaKeka1.getTimestamp(),
    },
    {
      _id: chatIds.lazaKeka2,
      senderId: userIds.laza,
      receiverId: userIds.keka,
      message: 'that last one was close, your Thresh hooks carried',
      dateCreated: chatIds.lazaKeka2.getTimestamp(),
    },
    {
      _id: chatIds.lazaKeka3,
      senderId: userIds.keka,
      receiverId: userIds.laza,
      message: 'same time tomorrow?',
      dateCreated: chatIds.lazaKeka3.getTimestamp(),
    },
    {
      _id: chatIds.anjaZile1,
      senderId: userIds.zile,
      receiverId: userIds.anja,
      message: 'do you still need a top laner?',
      dateCreated: chatIds.anjaZile1.getTimestamp(),
    },
    {
      _id: chatIds.anjaZile2,
      senderId: userIds.anja,
      receiverId: userIds.zile,
      message: 'yes, we play most evenings after 8',
      dateCreated: chatIds.anjaZile2.getTimestamp(),
    },
  ];

  await db.collection('chats').insertMany(chats);

  const reviews = [
    {
      _id: reviewIds.lazaOnMihi,
      reviewerId: userIds.laza,
      targetId: userIds.mihi,
      comment: 'Great duo partner, kept calm when we were behind and never flamed.',
      status: 'ACTIVE',
      dateCreated: reviewIds.lazaOnMihi.getTimestamp(),
    },
    {
      _id: reviewIds.anjaOnMihi,
      reviewerId: userIds.anja,
      targetId: userIds.mihi,
      comment: 'Solid mid laner and actually tracks the enemy jungler. Would queue again.',
      status: 'ACTIVE',
      dateCreated: reviewIds.anjaOnMihi.getTimestamp(),
    },
    {
      _id: reviewIds.djoleOnMihi,
      reviewerId: userIds.djole,
      targetId: userIds.mihi,
      comment: 'Good comms, called objectives early. Slightly greedy on dives.',
      status: 'ACTIVE',
      dateCreated: reviewIds.djoleOnMihi.getTimestamp(),
    },
    {
      _id: reviewIds.zileOnMihi,
      reviewerId: userIds.zile,
      targetId: userIds.mihi,
      comment: 'Played three games together, all wins. Knows when to reset.',
      status: 'ACTIVE',
      dateCreated: reviewIds.zileOnMihi.getTimestamp(),
    },
    {
      _id: reviewIds.kekaOnMihi,
      reviewerId: userIds.keka,
      targetId: userIds.mihi,
      comment: 'Friendly and patient with a newer player, explained matchups after the game.',
      status: 'ACTIVE',
      dateCreated: reviewIds.kekaOnMihi.getTimestamp(),
    },
    {
      _id: reviewIds.elenaOnMihi,
      reviewerId: userIds.elena,
      targetId: userIds.mihi,
      comment: 'Reliable, showed up on time for a scheduled duo session.',
      status: 'ACTIVE',
      dateCreated: reviewIds.elenaOnMihi.getTimestamp(),
    },
    {
      _id: reviewIds.pajaOnMihi,
      reviewerId: userIds.paja,
      targetId: userIds.mihi,
      comment: 'This review was removed and should not appear in the list.',
      status: 'DELETED',
      dateCreated: reviewIds.pajaOnMihi.getTimestamp(),
    },
    {
      _id: reviewIds.mihiOnLaza,
      reviewerId: userIds.mihi,
      targetId: userIds.laza,
      comment: 'Best bot lane partner I have queued with. Great wave management.',
      status: 'ACTIVE',
      dateCreated: reviewIds.mihiOnLaza.getTimestamp(),
    },
    {
      _id: reviewIds.anjaOnLaza,
      reviewerId: userIds.anja,
      targetId: userIds.laza,
      comment: 'Very good support, roams well and warded the whole river.',
      status: 'ACTIVE',
      dateCreated: reviewIds.anjaOnLaza.getTimestamp(),
    },
    {
      _id: reviewIds.kekaOnLaza,
      reviewerId: userIds.keka,
      targetId: userIds.laza,
      comment: 'Positive attitude even after a rough start. Easy to play with.',
      status: 'ACTIVE',
      dateCreated: reviewIds.kekaOnLaza.getTimestamp(),
    },
    {
      _id: reviewIds.mihiOnAnja,
      reviewerId: userIds.mihi,
      targetId: userIds.anja,
      comment: 'Strong jungler, punishes mistakes fast. Communication could be clearer.',
      status: 'ACTIVE',
      dateCreated: reviewIds.mihiOnAnja.getTimestamp(),
    },
    {
      _id: reviewIds.lazaOnAnja,
      reviewerId: userIds.laza,
      targetId: userIds.anja,
      comment: 'Reliable ganks and always pings before diving. Recommended.',
      status: 'ACTIVE',
      dateCreated: reviewIds.lazaOnAnja.getTimestamp(),
    },
    {
      _id: reviewIds.mihiOnDjole,
      reviewerId: userIds.mihi,
      targetId: userIds.djole,
      comment: 'Knows the jungle matchups in depth and plays to the win condition.',
      status: 'ACTIVE',
      dateCreated: reviewIds.mihiOnDjole.getTimestamp(),
    },
    {
      _id: reviewIds.zileOnDjole,
      reviewerId: userIds.zile,
      targetId: userIds.djole,
      comment: 'Good tempo player, though he tilts a little when behind.',
      status: 'ACTIVE',
      dateCreated: reviewIds.zileOnDjole.getTimestamp(),
    },
    {
      _id: reviewIds.djoleOnZile,
      reviewerId: userIds.djole,
      targetId: userIds.zile,
      comment: 'Dependable top laner, holds side lane without needing help.',
      status: 'ACTIVE',
      dateCreated: reviewIds.djoleOnZile.getTimestamp(),
    },
  ];

  await db.collection('reviews').insertMany(reviews);

  await db.collection('admins').insertOne({
    _id: new ObjectId(),
    username: 'admin',
    password: '$argon2id$v=19$m=65536,t=3,p=4$i4Gm1FAOWEmS+eefRBlHwg$s5siNubAhZQuC+UT/Ho1e/Rc/AHJ+VqbeSkBFF41/uE',
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
