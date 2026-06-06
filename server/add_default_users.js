
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function addDefaultUsers() {
  try {
    console.log('Connecting to database:', process.env.DB_NAME || 'sistem_futsal_armada');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sistem_futsal_armada'
    });

    console.log('✅ Connected!');

    console.log('\nChecking if user table exists...');
    try {
      await connection.execute('SELECT 1 FROM user LIMIT 1');
    } catch (tableErr) {
      console.log('Creating user table...');
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS user (
          user_id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
      console.log('✅ User table created!');
    }

    console.log('\nAdding default users...');
    
    const [adminCheck] = await connection.execute("SELECT * FROM user WHERE username = ?", ['admin']);
    if (adminCheck.length === 0) {
      const adminPass = await bcrypt.hash('admin123', 10);
      await connection.execute("INSERT INTO user (username, password, role) VALUES (?, ?, ?)", ['admin', adminPass, 'Admin']);
      console.log('✅ Admin user created: username=admin, password=admin123');
    } else {
      console.log('ℹ️ Admin user already exists!');
    }

    const [coachCheck] = await connection.execute("SELECT * FROM user WHERE username = ?", ['coach']);
    if (coachCheck.length === 0) {
      const coachPass = await bcrypt.hash('coach123', 10);
      await connection.execute("INSERT INTO user (username, password, role) VALUES (?, ?, ?)", ['coach', coachPass, 'Jurulatih']);
      console.log('✅ Coach user created: username=coach, password=coach123');
    } else {
      console.log('ℹ️ Coach user already exists!');
    }

    const [allUsers] = await connection.execute('SELECT user_id, username, role FROM user');
    console.log('\nAll users in database:', allUsers);

    await connection.end();
    console.log('\n✅ Done! Now you can login!');
  } catch (error) {
    console.error('❌ ERROR:', error);
  }
}

addDefaultUsers();
