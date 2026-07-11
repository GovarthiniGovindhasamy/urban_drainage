const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

const db = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '1234',
  database: 'urban_db'
});

db.connect((err) => {
  if (err) { console.error('Connection error:', err); process.exit(1); }
  console.log('Connected to urban_db');

  // Step 1: Add location column (ignore error if already exists)
  db.query(`ALTER TABLE workers ADD COLUMN location VARCHAR(100) DEFAULT 'Chennai'`, (err) => {
    if (err && err.code !== 'ER_DUP_FIELDNAME') {
      console.error('ALTER error:', err);
    } else {
      console.log('✅ location column ready');
    }

    // Step 2: Update existing 3 workers with cities
    const updates = [
      ['Coimbatore', 1],
      ['Chennai', 2],
      ['Erode', 3],
    ];
    let done = 0;
    updates.forEach(([city, id]) => {
      db.query('UPDATE workers SET location = ? WHERE worker_id = ?', [city, id], (err) => {
        if (err) console.error(`Update worker ${id}:`, err);
        else console.log(`✅ Worker ${id} → ${city}`);
        if (++done === updates.length) insertNewWorkers();
      });
    });
  });
});

function insertNewWorkers() {
  const hash = bcrypt.hashSync('worker123', 10);

  // Insert additional workers across Tamil Nadu cities
  const newWorkers = [
    [4, 'Arun Pandi',   '+91-9001001001', 'arun@work.com',   hash, 'Salem'],
    [5, 'Karthik Raja', '+91-9002002002', 'karthik@work.com', hash, 'Madurai'],
    [6, 'Murugan S',    '+91-9003003003', 'murugan@work.com', hash, 'Trichy'],
    [7, 'Priya Devi',   '+91-9004004004', 'priya@work.com',   hash, 'Coimbatore'],
    [8, 'Senthil V',    '+91-9005005005', 'senthil@work.com', hash, 'Chennai'],
    [9, 'Dinesh K',     '+91-9006006006', 'dinesh@work.com',  hash, 'Erode'],
    [10,'Anitha R',     '+91-9007007007', 'anitha@work.com',  hash, 'Salem'],
    [11,'Bala M',       '+91-9008008008', 'bala@work.com',    hash, 'Madurai'],
  ];

  let inserted = 0;
  newWorkers.forEach(([wid, name, phone, email, pwd, city]) => {
    db.query(
      `INSERT IGNORE INTO workers (worker_id, name, phone, email, password_hash, location) VALUES (?,?,?,?,?,?)`,
      [wid, name, phone, email, pwd, city],
      (err) => {
        if (err) console.error(`Insert worker ${wid}:`, err.message);
        else console.log(`✅ Inserted ${name} (${city})`);
        if (++inserted === newWorkers.length) {
          console.log('\n🎉 Migration complete!');
          db.query('SELECT worker_id, name, phone, location FROM workers ORDER BY worker_id', (err, rows) => {
            if (!err) {
              console.log('\nCurrent workers:');
              rows.forEach(r => console.log(`  #${r.worker_id} ${r.name} | ${r.phone} | ${r.location}`));
            }
            db.end();
          });
        }
      }
    );
  });
}
