const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '1234',
  database: 'urban_db'
});

db.connect((err) => {
  if (err) { console.error('DB connection failed:', err.message); process.exit(1); }

  // Use IF NOT EXISTS trick via SHOW COLUMNS instead for older MySQL
  db.query(`SHOW COLUMNS FROM complaints LIKE 'images'`, (err, rows) => {
    if (err) { console.error('Error checking column:', err.message); db.end(); process.exit(1); }

    if (rows.length > 0) {
      console.log('✅ Column "images" already exists in complaints table.');
      db.end();
    } else {
      db.query(`ALTER TABLE complaints ADD COLUMN images LONGTEXT NULL`, (err2) => {
        if (err2) { console.error('Error adding column:', err2.message); db.end(); process.exit(1); }
        console.log('✅ Column "images" added to complaints table successfully!');
        db.end();
      });
    }
  });
});
