/* ============================================
   SERVER - Express.js backend for portfolio
   ============================================ */

const express  = require('express');
const cors = require('cors');
const path     = require('path');
const { insertContact } = require('./database');
const { normalize } = require('path/posix');
const contacts = require('./contacts.json');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── Static files: serve everything in ../public ──
// Files served: index.html, style.css, main.js,
//               resume.pdf, certificates/*.pdf

app.use(express.static(path.join(__dirname, 'public')));

// ── API: Get all contacts ─────────────────────
const fs = require('fs');

app.get('/api/contacts', (req, res) => {
    const contacts = JSON.parse(
        fs.readFileSync('./contacts.json', 'utf8')
    );
    res.json(contacts);
});
// ── API: Contact form ─────────────────────────
app.post('/api/contact', (req, res) => {
  const { name, email, subject, message } = req.body;

  // Basic server-side validation
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }
  if (!/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email address.' });
  }

  try {
    const result = insertContact({ name, email, subject, message });
    console.log("Contact Saved:", result);
    return res.json({ success: true, message: "Message received! I'll get back to you soon." });
  } catch (err) {
    console.error('DB insert error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
});

// ── Resume download ───────────────────────────
// Express static already handles /resume.pdf, but
// this explicit route adds the Content-Disposition
// header so the browser always downloads it.
app.get('/resume.pdf', (req, res) => {
  const filePath = path.join(__dirname, '..', 'public', 'resume.pdf');
  res.download(filePath, 'Gaddam_AdiLakshmi_Resume.pdf', (err) => {
    if (err) {
      // File not found – send a helpful message instead of crashing
      console.warn('resume.pdf not found:', err.message);
      res.status(404).send('Resume not found. Please place resume.pdf in the public/ folder.');
    }
  });
});

// ── Certificate viewer ────────────────────────
// Express static already serves /certificates/*.pdf,
// but this explicit route adds inline display headers.
app.get('/certificates/:filename', (req, res) => {
  const { filename } = req.params;
  // Only allow PDF files to prevent directory traversal
  if (!filename.endsWith('.pdf') || filename.includes('/') || filename.includes('..')) {
    return res.status(400).send('Invalid file request.');
  }
  const filePath = path.join(__dirname, '..', 'public', 'certificates', filename);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
  res.sendFile(filePath, (err) => {
    if (err) {
      console.warn(`Certificate not found: ${filename}:`, err.message);
      res.status(404).send(`Certificate "${filename}" not found. Place the file in public/certificates/.`);
    }
  });
});

// ── Catch-all: SPA fallback ───────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// ── Start server ──────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Portfolio server running!`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Press Ctrl+C to stop.\n`);
});
