const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Your PostgreSQL connection string
});

// Endpoint to create a user
app.post('/api/users', async (req, res) => {
  const { userId, firstName, lastName } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO users (userid, firstname, lastname) VALUES ($1, $2, $3) RETURNING *',
      [userId, firstName, lastName]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});