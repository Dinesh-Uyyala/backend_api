const express = require('express');
const mysql = require('mysql2');
require('dotenv').config();
const cors = require('cors');
const e = require('express');

const app = express();
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies
const port = process.env.PORT || 3000;

// MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to Database!');
});

// Default route
app.get('/', (req, res) => {
res.send('Hello World!');
console.log("Welcome to the server!");
});

// Get all users
app.get('/users', (req, res) => {
  db.query('SELECT id,name,email,mobile,roleId FROM users', (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(results);
  });
});

// Get user by ID
app.get('/users/:id', (req, res) => {
  const userId = req.params.id;
  db.query('SELECT id,name,email,mobile,roleId FROM users WHERE id = ?', [userId], (err, results) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(results[0]);
  });
});

// Create a new user
app.post('/users', (req, res) => {
  const { name, email,mobile,password} = req.body;
  db.query('INSERT INTO users (name, email,mobile,password,roleId) VALUES (?, ?,?,?, ?)', [name, email,mobile,password, 1], (err, results) => {
    if (err) {
      console.error('Error creating user:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.status(201).json({ id: results.insertId, name, email,mobile,password, roleId: 1 });
  });
});

// Create a new Admin user
app.post('/admin', (req, res) => {
    const { name, email,mobile,password } = req.body;
    db.query('INSERT INTO users (name, email,mobile,password,roleId) VALUES (?, ?,?,?,?)', [name, email,mobile,password, 2], (err, results) => {
      if (err) {
        console.error('Error creating user:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      res.status(201).json({ id: results.insertId, name, email,mobile,password, roleId: 2 });
    });
  });

// Update a user
app.put('/users/:id', (req, res) => {
  const userId = req.params.id;
  const { name, email,mobile,password } = req.body;
  db.query('UPDATE users SET name = ?, email = ?, mobile = ?, password = ? WHERE id = ?', [name, email,mobile,password, id], (err, results) => {
    if (err) {
      console.error('Error updating user:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ id: userId, name, email,mobile,password });
  });
});

// Delete a user
app.delete('/users/:id', (req, res) => {
  const userId = req.params.id;
  db.query('DELETE FROM users WHERE id = ?', [userId], (err, results) => {
    if (err) {
      console.error('Error deleting user:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(204).send(); // No content
  });
});

// login
app.post('/users/login', (req, res) => {
  const { email, password } = req.body;
  db.query('SELECT id,name,email,mobile,roleId FROM users WHERE email = ? AND password = ?', [email, password], (err, results) => {
    if (err) {
      console.error('Error logging in:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json(results[0]);
  });
});

// Get all jobs
app.get('/jobs', (req, res) => {
  db.query('SELECT * FROM jobs', (err, results) => {
    if (err) {
      console.error('Error fetching jobs:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(results);
  });
});
// Get job by ID
app.get('/jobs/:id', (req, res) => {
  const jobId = req.params.id;
  db.query('SELECT * FROM jobs WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error fetching job:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json(results[0]);
  });
});
// Create a new job
app.post('/jobs', (req, res) => {
  const { title, description, companyName, location, vacancies, logo, package,experience, workMode} = req.body;
  db.query('INSERT INTO jobs (title, description, companyName, location, vacancies, logo, package, experience, workMode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [title, description, companyName, location, vacancies, logo, package, experience, workMode], (err, results) => {
    if (err) {
      console.error('Error creating job:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.status(201).json({ id: results.insertId, title, description, companyName, location, vacancies, logo, experience, package, workMode });
  });
});
// Update a job
app.put('/jobs/:id', (req, res) => {
  const jobId = req.params.id;
  const { title, description, companyName, location, vacancies, logo, package, experience, workMode} = req.body;
  db.query('UPDATE jobs SET title = ?, description = ?, companyName = ?, location = ?,  vacancies = ?, logo = ?, package= ?, experience=?, workMode= ? WHERE id = ?', [title, description, companyName, location, vacancies, logo, package,experience, workMode, jobId], (err, results) => {
    if (err) {
      console.error('Error updating job:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json({ id: jobId, title, description, companyName, location, vacancies, logo, package, experience, workMode});
  });
});
// Delete a job
app.delete('/jobs/:id', (req, res) => {
  const jobId = req.params.id;
  db.query('DELETE FROM jobs WHERE id = ?', [jobId], (err, results) => {
    if (err) {
      console.error('Error deleting job:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.status(204).send(); // No content
  });
});





app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
