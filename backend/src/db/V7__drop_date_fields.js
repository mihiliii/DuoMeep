db.chats.updateMany({ date: { $exists: true } }, { $unset: { date: '' } });
db.reviews.updateMany({ date: { $exists: true } }, { $unset: { date: '' } });
db.match_me.updateMany({ dateCreated: { $exists: true } }, { $unset: { dateCreated: '' } });
