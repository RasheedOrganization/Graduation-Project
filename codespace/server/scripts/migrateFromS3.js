#!/usr/bin/env node
require("dotenv").config();
// Optional helper to migrate existing S3 objects to local test data storage.
// Requires the AWS CLI to be installed and configured.

const { execSync } = require('child_process');
const path = require('path');

const bucket = process.argv[2];
if (!bucket) {
  console.error('Usage: node scripts/migrateFromS3.js <s3-bucket-name>');
  process.exit(1);
}

const destDir = path.resolve(__dirname, '..', process.env.TEST_DATA_DIR || './test-data');

try {
  execSync(`aws s3 sync s3://${bucket} ${destDir}`, { stdio: 'inherit' });
} catch (err) {
  console.error('Migration failed:', err.message);
  process.exit(1);
}
