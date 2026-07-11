const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const db = mysql.createConnection({ host: 'localhost', user: 'root', password: '1234', database: 'urban_db' });

db.query('CREATE TABLE IF NOT EXISTS workers (worker_id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), phone VARCHAR(50), email VARCHAR(255), password_hash VARCHAR(255))', (err) => {
    if (err) console.error(err);

    db.query('ALTER TABLE workers ADD COLUMN email VARCHAR(255), ADD COLUMN password_hash VARCHAR(255)', (err) => {
        const hash = bcrypt.hashSync('worker123', 10);
        db.query('INSERT IGNORE INTO workers (worker_id, name, phone, email, password_hash) VALUES (1, "Suresh Kumar", "+1234567890", "worker1@example.com", ?), (2, "Ravi Teja", "+1987654321", "worker2@example.com", ?), (3, "Vikram Singh", "+1122334455", "worker3@example.com", ?)', [hash, hash, hash], (err) => {
            db.query('ALTER TABLE complaints ADD COLUMN expected_from_date DATE, ADD COLUMN expected_to_date DATE, ADD COLUMN proof_photo LONGTEXT, ADD COLUMN worker_name VARCHAR(255), ADD COLUMN worker_phone VARCHAR(50), ADD COLUMN worker_id INT', (err) => {
                db.query('ALTER TABLE complaints ADD COLUMN proof_photo LONGTEXT, ADD COLUMN worker_name VARCHAR(255), ADD COLUMN worker_phone VARCHAR(50), ADD COLUMN worker_id INT', (err) => {
                    console.log('Database setup complete');
                    db.end();
                });
            });
        });
    });
});
