// Database initialization script using mysql2
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDatabase() {
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'jobs';

  console.log(`Connecting to MySQL server at ${host}:${port} as ${user}...`);

  // Connect to server (without selecting database initially)
  const connection = await mysql.createConnection({
    host,
    port,
    user,
    password,
    multipleStatements: true
  });

  try {
    console.log(`Creating database "${database}" if not exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.query(`USE \`${database}\`;`);

    // Execute schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      console.log('Executing schema.sql...');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await connection.query(schemaSql);
      console.log('✓ Schema created successfully.');
    }

    // Execute seed.sql
    const seedPath = path.join(__dirname, 'seed.sql');
    if (fs.existsSync(seedPath)) {
      console.log('Executing seed.sql...');
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      await connection.query(seedSql);
      console.log('✓ Seed data inserted successfully.');
    }

    const [jobsCount] = await connection.query('SELECT COUNT(*) as count FROM jobs');
    const [appsCount] = await connection.query('SELECT COUNT(*) as count FROM applications');

    console.log(`\nDatabase "${database}" is ready.`);
    console.log(`Jobs count: ${jobsCount[0].count}`);
    console.log(`Applications count: ${appsCount[0].count}`);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

initDatabase();
