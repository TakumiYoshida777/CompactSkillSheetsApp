#!/usr/bin/env node

const bcrypt = require('bcrypt');

const password = process.argv[2];

if (!password) {
  console.error('Usage: node generate-hash.js <password>');
  process.exit(1);
}

const ROUNDS = 10;

bcrypt.hash(password, ROUNDS, (err, hash) => {
  if (err) {
    console.error('Error generating hash:', err);
    process.exit(1);
  }
  console.log('Password:', password);
  console.log('Hash:', hash);
});