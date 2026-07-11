const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

const db = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '1234',
  database: 'urban_db'
});

const fs = require('fs');
db.connect((err) => {
  if (err) {
    console.error('Error:', err);
    process.exit(1);
  }
  db.query('SELECT * FROM workers', (err, results) => {
    if (err) {
      console.error('Query error:', err);
    } else {
      fs.writeFileSync('db_out_node.json', JSON.stringify(results, null, 2));
    }
    db.end();
  });
});
