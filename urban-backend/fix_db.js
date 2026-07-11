const mysql = require('mysql2');
const db = mysql.createConnection({ host: 'localhost', user: 'root', password: '1234', database: 'urban_db' });
db.connect(err => {
  if (err) throw err;
  const columns = [
    'expected_from_date DATE',
    'expected_to_date DATE',
    'worker_name VARCHAR(255)',
    'worker_phone VARCHAR(50)',
    'worker_id INT',
    'proof_photo LONGTEXT'
  ];
  let pending = columns.length;
  columns.forEach(col => {
    db.query(`ALTER TABLE complaints ADD COLUMN ${col}`, (err) => {
      console.log(err ? `Skipped ${col} (exists)` : `Added ${col}`);
      pending--;
      if (pending === 0) db.end();
    });
  });
});
