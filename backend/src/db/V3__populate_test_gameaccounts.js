const katoId = new ObjectId();
const sanaId = new ObjectId();
const draviId = new ObjectId();

db.users.insertMany([
  {
    _id: katoId,
    username: 'kato',
    avatarPath: 'public/images/avatar_default.png',
    authInfo: {
      email: 'kato@test.com',
      // password: Kato1234
      password: '$argon2id$v=19$m=65536,t=3,p=4$AAhLnGFjxKANboKweoSxoQ$I9obxJyvVr7uL3mxysMoYC9Tps8fsImCsijBtpokPs4',
    },
    dashboard: {
      bio: 'Top laner, one-trick Darius.',
      tagline: 'Never surrender',
      banner: '',
    },
    status: 'ACTIVE',
  },
  {
    _id: sanaId,
    username: 'sana',
    avatarPath: 'public/images/avatar_default.png',
    authInfo: {
      email: 'sana@test.com',
      // password: Sana1234
      password: '$argon2id$v=19$m=65536,t=3,p=4$PL1GKodx3D/IegQyNHyBEw$0pc7x3BbCBrZWK1CUuJVnMF0ceCJGyH0HbUBWWQtvY4',
    },
    dashboard: {
      bio: 'ADC main, climbing to Challenger.',
      tagline: 'Carry or die',
      banner: '',
    },
    status: 'ACTIVE',
  },
  {
    _id: draviId,
    username: 'dravi',
    avatarPath: 'public/images/avatar_default.png',
    authInfo: {
      email: 'dravi@test.com',
      // password: Dravi123
      password: '$argon2id$v=19$m=65536,t=3,p=4$AAhLnGFjxKANboKweoSxoQ$I9obxJyvVr7uL3mxysMoYC9Tps8fsImCsijBtpokPs4',
    },
    dashboard: {
      bio: 'Casual player, mostly TFT these days.',
      tagline: 'Little legend enjoyer',
      banner: '',
    },
    status: 'ACTIVE',
  },
]);

db.game_accounts.insertMany([
  {
    _id: new ObjectId(),
    name: 'KatoTopLane#EUW1',
    region: 'EUW',
    rank: 'PLATINUM',
    userId: katoId,
    status: 'ACTIVE',
  },
  {
    _id: new ObjectId(),
    name: 'SanaCarries#KR01',
    region: 'KR',
    rank: 'GRANDMASTER',
    userId: sanaId,
    status: 'ACTIVE',
  },
  {
    _id: new ObjectId(),
    name: 'DraviChill#NA22',
    region: 'NA',
    rank: 'UNRANKED',
    userId: draviId,
    status: 'ACTIVE',
  },
]);
