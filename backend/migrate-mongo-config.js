const config = {
  mongodb: {
    url: process.env.MONGO_URI || 'mongodb://admin:password123@localhost:27017/duomeep_db?authSource=admin',
    options: {},
  },
  migrationsDir: 'migrations',
  changelogCollectionName: 'changelog',
  lockCollectionName: 'changelog_lock',
  lockTtl: 0,
  migrationFileExtension: '.js',
  useFileHash: false,
  moduleSystem: 'esm',
};

export default config;
