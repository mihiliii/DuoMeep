const mihi = db.users.findOne({ username: 'mihi' });
const nova = db.users.findOne({ username: 'nova' });
const anja = db.users.findOne({ username: 'anja' });
const ghost = db.users.findOne({ username: 'ghost' });

const minutesAgo = (minutes) => new Date(Date.now() - minutes * 60000);
const idAt = (date) => ObjectId.createFromTime(Math.floor(date.getTime() / 1000));

db.chats.insertMany([
  {
    _id: idAt(minutesAgo(46)),
    senderId: mihi._id,
    receiverId: nova._id,
    message: 'hey, saw your Match Me post. still looking for a duo?',
  },
  {
    _id: idAt(minutesAgo(44)),
    senderId: nova._id,
    receiverId: mihi._id,
    message: 'yeah! what role do you play?',
  },
  {
    _id: idAt(minutesAgo(43)),
    senderId: mihi._id,
    receiverId: nova._id,
    message: 'mid mostly, but I can fill jungle if you need it',
  },
  {
    _id: idAt(minutesAgo(41)),
    senderId: nova._id,
    receiverId: mihi._id,
    message: 'perfect, I am bot lane. queue up in 10?',
  },
  {
    _id: idAt(minutesAgo(40)),
    senderId: mihi._id,
    receiverId: nova._id,
    message: 'see you in queue',
  },

  {
    _id: idAt(minutesAgo(180)),
    senderId: anja._id,
    receiverId: mihi._id,
    message: 'gg earlier, that was a rough game',
  },
  {
    _id: idAt(minutesAgo(175)),
    senderId: mihi._id,
    receiverId: anja._id,
    message: 'no worries, we can run it back tomorrow',
  },

  {
    _id: idAt(minutesAgo(120)),
    senderId: ghost._id,
    receiverId: mihi._id,
    message: 'this message should never appear in the conversation list',
  },

  {
    _id: idAt(minutesAgo(30)),
    senderId: nova._id,
    receiverId: anja._id,
    message: 'are you playing tonight?',
  },
]);
