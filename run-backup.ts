import { createDatabaseBackup } from './server/backup';

createDatabaseBackup()
  .then(result => {
    console.log('\n=== Backup Result ===');
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('Backup failed:', error);
    process.exit(1);
  });
