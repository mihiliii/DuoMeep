const existing = db.getCollectionNames();

if (!existing.includes('admins')) {
  db.createCollection('admins', {
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
  });
}
db.admins.createIndex({ username: 1 }, { unique: true });

db.admins.insertOne({
  _id: new ObjectId(),
  username: 'admin',
  // password: Admin123
  password: '$argon2id$v=19$m=65536,t=3,p=4$ySnKZZkph0uPR6agj38hBA$oo3gzgaohlkhumhx/2chtsJLdskHMYjJhR7HRwNCDog',
});
