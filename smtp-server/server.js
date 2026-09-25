require('dotenv').config();
const { SMTPServer } = require('smtp-server');
const { simpleParser } = require('mailparser');
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'phonemail',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'phonemail_db',
  password: process.env.DB_PASSWORD || 'phonemail_password',
  port: process.env.DB_PORT || 5432,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS emails (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        sender_address VARCHAR(255),
        recipient_address VARCHAR(255),
        subject TEXT,
        body_html TEXT,
        body_text TEXT,
        read_status BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        phone_number VARCHAR(20) UNIQUE,
        password VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Database initialized');
  } finally {
    client.release();
  }
}

initDB().catch(console.error);

const server = new SMTPServer({
  secure: false,
  authOptional: true,
  onData(stream, session, callback) {
    simpleParser(stream, async (err, parsed) => {
      if (err) {
        console.error('Error parsing email:', err);
        return callback(err);
      }
      
      const sender = parsed.from.value[0].address;
      const to = parsed.to.value.map(val => val.address).join(', ');
      
      console.log(`Received email from ${sender} to ${to}`);
      
      try {
        await pool.query(
          'INSERT INTO emails (sender_address, recipient_address, subject, body_html, body_text) VALUES ($1, $2, $3, $4, $5)',
          [sender, to, parsed.subject, parsed.html, parsed.text]
        );
        console.log('Email saved to database.');
      } catch (dbErr) {
        console.error('Database error:', dbErr);
      }
      
      callback();
    });
  }
});

server.listen(25, '0.0.0.0', () => {
  console.log('SMTP Server running on port 25');
});
