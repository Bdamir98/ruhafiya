const bcrypt = require('bcryptjs');

// Test the password hash from the database
const storedHash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXwtGtrKxQ7u';
const testPassword = 'admin123';

console.log('Testing password hash...');
console.log('Password:', testPassword);
console.log('Stored hash:', storedHash);

bcrypt.compare(testPassword, storedHash, (err, result) => {
  if (err) {
    console.error('Error comparing password:', err);
  } else {
    console.log('Password match result:', result);
  }
});

// Also generate a new hash for comparison
bcrypt.hash(testPassword, 12, (err, newHash) => {
  if (err) {
    console.error('Error generating hash:', err);
  } else {
    console.log('New hash for comparison:', newHash);
  }
});