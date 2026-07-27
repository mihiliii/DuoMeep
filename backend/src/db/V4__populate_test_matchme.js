const kato = db.users.findOne({ username: 'kato' });
const sana = db.users.findOne({ username: 'sana' });
const dravi = db.users.findOne({ username: 'dravi' });

const katoAccount = db.game_accounts.findOne({ userId: kato._id });
const sanaAccount = db.game_accounts.findOne({ userId: sana._id });
const draviAccount = db.game_accounts.findOne({ userId: dravi._id });

db.match_me.insertMany([
  {
    _id: new ObjectId(),
    dateCreated: new Date(),
    userId: kato._id,
    accountId: katoAccount._id,
    roles: ['TOP'],
    description: 'One-trick Darius looking for a jungle duo to climb with.',
    requirements: { minRank: 'GOLD' },
    status: 'ACTIVE',
  },
  {
    _id: new ObjectId(),
    dateCreated: new Date(),
    userId: sana._id,
    accountId: sanaAccount._id,
    roles: ['BOT'],
    description: 'ADC main grinding to Challenger, need a support duo.',
    requirements: { minRank: 'DIAMOND', roles: ['SUPPORT'] },
    status: 'ACTIVE',
  },
  {
    _id: new ObjectId(),
    dateCreated: new Date(),
    userId: dravi._id,
    accountId: draviAccount._id,
    roles: ['FILL'],
    description: 'Casual player mostly into TFT, up for anything low-pressure.',
    requirements: {},
    status: 'ACTIVE',
  },
]);
