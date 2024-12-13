import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const db = new Database('mentorship.db');
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

app.use(cors());
app.use(express.json());

// Initialize database tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    role TEXT NOT NULL,
    name TEXT NOT NULL,
    bio TEXT,
    skills TEXT,
    interests TEXT,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS mentorship_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mentor_id INTEGER NOT NULL,
    mentee_id INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mentor_id) REFERENCES users (id),
    FOREIGN KEY (mentee_id) REFERENCES users (id)
  );
`);

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Auth routes
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const stmt = db.prepare('INSERT INTO users (email, password) VALUES (?, ?)');
    const result = stmt.run(email, hashedPassword);
    
    res.status(201).json({ id: result.lastInsertRowid });
  } catch (error) {
    res.status(400).json({ error: 'Email already exists' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  const user = stmt.get(email);
  
  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }
  
  const token = jwt.sign({ id: user.id }, JWT_SECRET);
  res.json({ token });
});

// Profile routes
app.post('/api/profiles', authenticateToken, (req, res) => {
  const { role, name, bio, skills, interests } = req.body;
  const userId = req.user.id;
  
  const stmt = db.prepare(`
    INSERT INTO profiles (user_id, role, name, bio, skills, interests)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(userId, role, name, bio, skills, interests);
  res.status(201).json({ id: result.lastInsertRowid });
});

app.get('/api/profiles', authenticateToken, (req, res) => {
  const stmt = db.prepare(`
    SELECT p.*, u.email
    FROM profiles p
    JOIN users u ON p.user_id = u.id
    WHERE p.role != (SELECT role FROM profiles WHERE user_id = ?)
  `);
  
  const profiles = stmt.all(req.user.id);
  res.json(profiles);
});

// Mentorship request routes
app.post('/api/mentorship-requests', authenticateToken, (req, res) => {
  const { mentorId } = req.body;
  const menteeId = req.user.id;
  
  const stmt = db.prepare(`
    INSERT INTO mentorship_requests (mentor_id, mentee_id)
    VALUES (?, ?)
  `);
  
  const result = stmt.run(mentorId, menteeId);
  res.status(201).json({ id: result.lastInsertRowid });
});

app.put('/api/mentorship-requests/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const stmt = db.prepare(`
    UPDATE mentorship_requests
    SET status = ?
    WHERE id = ? AND mentor_id = ?
  `);
  
  stmt.run(status, id, req.user.id);
  res.json({ message: 'Request updated' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});