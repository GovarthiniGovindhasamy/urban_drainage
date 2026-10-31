const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'urban_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Function to initialize tables
async function initializeTables() {
    try {
        const connection = await pool.getConnection();

        console.log('✅ Connected to MySQL database');

        // 1. Users Table (for Authentication & Profile)
        await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        zone VARCHAR(100),
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('citizen', 'worker', 'admin') DEFAULT 'citizen',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // 2. Requests Table (for Complaints)
        await connection.query(`
      CREATE TABLE IF NOT EXISTS requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        latitude VARCHAR(50),
        longitude VARCHAR(50),
        address VARCHAR(255),
        area VARCHAR(100),
        pincode VARCHAR(20),
        landmark VARCHAR(255),
        ward VARCHAR(50),
        priority ENUM('low', 'medium', 'high', 'emergency') DEFAULT 'medium',
        status ENUM('Submitted', 'In Progress', 'Cleared') DEFAULT 'Submitted',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

        // 3. Notifications Table
        await connection.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

        console.log('✅ Tables initialized successfully');
        connection.release();
    } catch (error) {
        // Note: If DB doesn't exist, you'll need to create it manually via MySQL first:
        // CREATE DATABASE urban_drainage;
        console.error('❌ Database Initialization Error:', error.message);
    }
}

// Run initialization
initializeTables();

module.exports = pool;
