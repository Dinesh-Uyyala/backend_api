const express = require('express');
const mysql = require('mysql2');
require('dotenv').config();
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');

const app = express();
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies
const upload = multer({ storage: multer.memoryStorage() }); // Store in memory buffer
app.use(express.json());
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

// File Upload
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const fileBuffer = req.file.buffer;
    const base64String = fileBuffer.toString('base64');
    const fileName = req.file.originalname;

    const connection = await pool.getConnection();
    await connection.execute(
      'INSERT INTO uploads (file_name, base64_data) VALUES (?, ?)',
      [fileName, base64String]
    );
    connection.release();

    res.status(200).json({ message: 'File uploaded successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Upload failed' });
  }
});

// Get all users
app.get('/users', (req, res) => {
  db.query('SELECT id,name,email,mobile FROM users', (err, results) => {
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
  db.query('INSERT INTO users (name, email,mobile,password) VALUES (?, ?,?,?)', [name, email,mobile,password], (err, results) => {
    if (err) {
      console.error('Error creating user:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.status(201).json({ id: results.insertId, name, email,mobile,password });
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
  db.query('SELECT id,name,email,mobile FROM users WHERE email = ? AND password = ?', [email, password], (err, results) => {
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


// vehicles
// Get all vehicles
app.get('/vehicles', (req, res) => {
  db.query('SELECT * FROM vehicles', (err, results) => {
    if (err) {
      console.error('Error fetching vehicles:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(results);
  });
});

// Get vehicle by ID
app.get('/vehicles/:id', (req, res) => {
  const vehicleId = req.params.id;
  db.query('SELECT * FROM vehicles WHERE id = ?', [vehicleId], (err, results) => {
    if (err) {
      console.error('Error fetching vehicle:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    res.json(results[0]);
  });
});

// Create a new vehicle
app.post('/vehicles', (req, res) => {
  const { vehicle, color, cost, fuel, image, manufacturer, model, type, tyres } = req.body;
  db.query(
    'INSERT INTO vehicles (vehicle, color, cost, fuel, image, manufacturer, model, type, tyres) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [vehicle, color, cost, fuel, image, manufacturer, model, type, tyres],
    (err, results) => {
      if (err) {
        console.error('Error creating vehicle:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      res.status(201).json({ id: results.insertId, vehicle, color, cost, fuel, image, manufacturer, model, type, tyres });
    }
  );
});

// Update a vehicle
app.put('/vehicles/:id', (req, res) => {
  const vehicleId = req.params.id;
  const { vehicle, color, cost, fuel, image, manufacturer, model, type, tyres } = req.body;
  db.query(
    'UPDATE vehicles SET vehicle = ?, color = ?, cost = ?, fuel = ?, image = ?, manufacturer = ?, model = ?, type = ?, tyres = ? WHERE id = ?',
    [vehicle, color, cost, fuel, image, manufacturer, model, type, tyres, vehicleId],
    (err, results) => {
      if (err) {
        console.error('Error updating vehicle:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }
      res.json({ id: vehicleId, vehicle, color, cost, fuel, image, manufacturer, model, type, tyres });
    }
  );
});

// Delete a vehicle
app.delete('/vehicles/:id', (req, res) => {
  const vehicleId = req.params.id;
  db.query('DELETE FROM vehicles WHERE id = ?', [vehicleId], (err, results) => {
    if (err) {
      console.error('Error deleting vehicle:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    res.status(204).send(); // No content
  });
});


// Products-- Fake store
// get all products
app.get('/products', (req, res) => {
  db.query('SELECT * FROM products', (err, results) => {
    if (err) {
      console.error('Error fetching products:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(results);
  });
});

// Get product by ID
app.get('/products/:id', (req, res) => {
  const productId = req.params.id;
  db.query('SELECT * FROM products WHERE id = ?', [productId], (err, results) => {
    if (err) {
      console.error('Error fetching product:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(results[0]);
  });
});

// Create a new product
app.post('/products', (req, res) => {
  const { title, price, description, category, image, rating } = req.body;
  const { rate, count } = rating;
  db.query(
    'INSERT INTO products (title, price, description, category, image, rate, count) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [title, price, description, category, image, rate, count],
    (err, results) => {
      if (err) {
        console.error('Error creating product:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      res.status(201).json({ id: results.insertId, title, price, description, category, image, rating: { rate, count } });
    }
  );
});

// Update a product
app.put('/products/:id', (req, res) => {
  const productId = req.params.id;
  const { title, price, description, category, image, rating } = req.body;
  const { rate, count } = rating;
  db.query(
    'UPDATE products SET title = ?, price = ?, description = ?, category = ?, image = ?, rate = ?, count = ? WHERE id = ?',
    [title, price, description, category, image, rate, count, productId],
    (err, results) => {
      if (err) {
        console.error('Error updating product:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json({ id: productId, title, price, description, category, image, rating: { rate, count } });
    }
  );
});

// Delete a product
app.delete('/products/:id', (req, res) => {
  const productId = req.params.id;
  db.query('DELETE FROM products WHERE id = ?', [productId], (err, results) => {
    if (err) {
      console.error('Error deleting product:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(204).send(); // No content
  });
});

// mails 
// get all mails
app.get('/mails', (req, res) => {
  db.query('SELECT * FROM mails', (err, results) => {
    if (err) {
      console.error('Error fetching mails:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(results);
  });
});

// Get mail by ID
app.get('/mails/:id', (req, res) => {
  const mailId = req.params.id;
  db.query('SELECT * FROM mails WHERE id = ?', [mailId], (err, results) => {
    if (err) {
      console.error('Error fetching mail:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Mail not found' });
    }
    res.json(results[0]);
  });
});

//post mail
app.post('/mails', (req, res) => {
  const { name, email, message, userId, completed, title } = req.body;
  db.query(
    'INSERT INTO mails (name, email, message, userId, completed, title) VALUES (?, ?, ?, ?, ?, ?)',
    [name, email, message, userId, completed, title],
    (err, results) => {
      if (err) {
        console.error('Error sending mail:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      res.status(201).json({ id: results.insertId, name, email, message, userId, completed, title });
    }
  );
});

// Update a mail
app.put('/mails/:id', (req, res) => {
  const mailId = req.params.id;
  const { name, email, message, userId, completed, title } = req.body;
  db.query(
    'UPDATE mails SET name = ?, email = ?, message = ?, userId = ?, completed = ?, title = ? WHERE id = ?',
    [name, email, message, userId, completed, title, mailId],
    (err, results) => {
      if (err) {
        console.error('Error updating mail:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Mail not found' });
      }
      res.json({ id: mailId, name, email, message, userId, completed, title });
    }
  );
});

// Delete a mail
app.delete('/mails/:id', (req, res) => {
  const mailId = req.params.id;
  db.query('DELETE FROM mails WHERE id = ?', [mailId], (err, results) => {
    if (err) {
      console.error('Error deleting mail:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Mail not found' });
    }
    res.status(204).send(); // No content
  });
});


// weather
// Get weather data
app.get('/weather', (req, res) => {
  db.query('SELECT * FROM weather', (err, results) => {
    if (err) {
      console.error('Error fetching weather data:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(results);
  });
});


// Photos
// Get all photos
app.get('/photos', (req, res) => {
  db.query('SELECT * FROM photos', (err, results) => {
    if (err) {
      console.error('Error fetching photos:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(results);
  });
});

// Get photo by ID
app.get('/photos/:id', (req, res) => {
  const photoId = req.params.id;
  db.query('SELECT * FROM photos WHERE id = ?', [photoId], (err, results) => {
    if (err) {
      console.error('Error fetching photo:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    res.json(results[0]);
  });
});

// Create a new photo
app.post('/photos', (req, res) => {
  const { author, width, height, image_url, download_url } = req.body;
  db.query('INSERT INTO photos (author, width, height, image_url, download_url) VALUES (?, ?, ?, ?, ?)', [author, width, height, image_url, download_url], (err, results) => {
    if (err) {
      console.error('Error creating photo:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.status(201).json({ id: results.insertId, author, width, height, image_url, download_url });
  });
});

// Update a photo
app.put('/photos/:id', (req, res) => {
  const photoId = req.params.id;
  const { author, width, height, image_url, download_url } = req.body;
  db.query('UPDATE photos SET author = ?, width = ?, height = ?, image_url = ?, download_url = ? WHERE id = ?', [author, width, height, image_url, download_url, photoId], (err, results) => {
    if (err) {
      console.error('Error updating photo:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    res.json({ id: photoId, author, width, height, image_url, download_url });
  });
});

// Delete a photo
app.delete('/photos/:id', (req, res) => {
  const photoId = req.params.id;
  db.query('DELETE FROM photos WHERE id = ?', [photoId], (err, results) => {
    if (err) {
      console.error('Error deleting photo:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    res.status(204).send(); // No content
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
