/* ============================================
   DATABASE.JS
   Uses better-sqlite3 when available (recommended).
   Falls back to a JSON flat-file store on systems
   where native compilation is unavailable.
   ============================================ */

const path = require('path');
const fs   = require('fs');

const DB_PATH   = path.join(__dirname, 'portfolio.db');
const JSON_PATH = path.join(__dirname, 'contacts.json');

let insertContact;
let getAllContacts;

// ── Attempt to use better-sqlite3 ─────────────
try {
  const Database = require('better-sqlite3');
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS contacts (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL,
      email      TEXT NOT NULL,
      subject    TEXT NOT NULL,
      message    TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
  console.log('✅ SQLite (better-sqlite3) connected:', DB_PATH);

  insertContact = ({ name, email, subject, message }) => {
    const stmt = db.prepare(
      `INSERT INTO contacts (name, email, subject, message)
       VALUES (@name, @email, @subject, @message)`
    );
    return stmt.run({ name, email, subject, message });
  };

  getAllContacts = () =>
    db.prepare('SELECT * FROM contacts ORDER BY id DESC').all();

} catch (err) {
  // ── Fallback: JSON flat file ─────────────────
  console.warn('⚠️  better-sqlite3 not available, using JSON file store.');
  console.warn('   Install note: run  npm install  on your local machine');
  console.warn('   to compile the native SQLite module for production use.\n');

  const readStore = () => {
    try { return JSON.parse(fs.readFileSync(JSON_PATH, 'utf8')); }
    catch (_) { return []; }
  };
  const writeStore = (data) =>
    fs.writeFileSync(JSON_PATH, JSON.stringify(data, null, 2), 'utf8');

  insertContact = ({ name, email, subject, message }) => {
    const contacts = readStore();
    const newContact = {
      id:         contacts.length + 1,
      name, email, subject, message,
      created_at: new Date().toISOString()
    };
    contacts.unshift(newContact);
    writeStore(contacts);
    return { lastInsertRowid: newContact.id, changes: 1 };
  };

  getAllContacts = () => readStore();
}

module.exports = { insertContact, getAllContacts };