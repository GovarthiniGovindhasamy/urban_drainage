-- Create Database
CREATE DATABASE IF NOT EXISTS urban_db;
USE urban_db;

-- Create Users Table (for Registration and Login)
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- Always hash passwords in production (e.g., bcrypt)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Complaints Table (for Dashboard)
CREATE TABLE IF NOT EXISTS complaints (
    complaint_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    description TEXT NOT NULL,
    location VARCHAR(255),
    area VARCHAR(255),
    pincode VARCHAR(20),
    landmark VARCHAR(255),
    ward VARCHAR(100),
    latitude VARCHAR(50),
    longitude VARCHAR(50),
    priority ENUM('low', 'medium', 'high', 'emergency') DEFAULT 'medium',
    status ENUM('Pending', 'In Progress', 'Resolved') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ==========================================
-- Example Queries for Application Logic
-- ==========================================

-- 1. Registration (Insert new user)
-- Note: Provide a hashed password from your backend logic
INSERT INTO users (username, email, password_hash) 
VALUES ('johndoe', 'johndoe@example.com', 'hashed_password_123');

-- 2. Login Check (Fetch user by email to verify password)
SELECT user_id, username, password_hash 
FROM users 
WHERE email = 'johndoe@example.com';

-- 3. Create a Complaint (When a user submits a report from the dashboard)
INSERT INTO complaints (user_id, title, description, location) 
VALUES (1, 'Blocked Drain', 'The drain in front of my house is completely blocked and overflowing.', '123 Main St, Springfield');

-- 4. Get all Complaints for a specific user (To display on their dashboard)
SELECT complaint_id, title, description, location, status, created_at 
FROM complaints 
WHERE user_id = 1 
ORDER BY created_at DESC;

-- 5. Update Complaint Status (For Admin/Maintenance side)
UPDATE complaints 
SET status = 'In Progress' 
WHERE complaint_id = 1;
