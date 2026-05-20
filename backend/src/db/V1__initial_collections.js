const existing = db.getCollectionNames();

if (!existing.includes("users")) db.createCollection("users");
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { unique: true });

if (!existing.includes("accounts")) db.createCollection("accounts");
db.accounts.createIndex({ puuid: 1 }, { unique: true });

if (!existing.includes("match_me")) db.createCollection("match_me");

if (!existing.includes("userDashboards")) db.createCollection("userDashboards");
