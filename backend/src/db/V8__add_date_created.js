const collections = ['users', 'game_accounts', 'match_me', 'reviews', 'chats'];

collections.forEach((name) => {
  db.getCollection(name).updateMany({ dateCreated: { $exists: false } }, [
    { $set: { dateCreated: { $toDate: '$_id' } } },
  ]);
});
