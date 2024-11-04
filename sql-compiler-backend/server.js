const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

// Create connection to the database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root', // use your MySQL username
  password: '', // use your MySQL password
  database: 'sql_compiler' // the name of your database
});

connection.connect(error => {
  if (error) {
    console.error('Error connecting to the database:', error.message);
    return;
  }
  console.log('Successfully connected to the database');
});

// Fetch all table names
app.get('/tables', (req, res) => {
  connection.query('SHOW TABLES', (err, results) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    const tables = results.map(row => Object.values(row)[0]);
    res.json({
      message: 'Tables fetched successfully',
      data: tables
    });
  });
});

// Fetch schema of a specific table
app.post('/table-schema', (req, res) => {
  const { tableName } = req.body;
  connection.query(`SELECT COLUMN_NAME, DATA_TYPE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`, [process.env.DB_NAME || 'sql_compiler', tableName],
    (err, results) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({
        message: `Schema fetched successfully for table ${tableName}`,
        data: results,
      });
    });
});

// Fetch data from a specific table
app.post('/table-data', (req, res) => {
  const { tableName } = req.body;
  connection.query('SELECT * FROM ??', [tableName], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: `Data fetched successfully from ${tableName}`,
      data: rows
    });
  });
});

// Execute any SQL query
app.post('/execute-query', (req, res) => {
  const { query } = req.body;
  connection.query(query, (err, results) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (query.trim().toLowerCase().startsWith('select')) {
      res.json({ data: results, message: `${results.length} rows returned` });
    } else {
      res.json({ data: [], message: `${results.affectedRows} rows affected` });
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});




// const db = new sqlite3.Database(':memory:', (err) => {
//   if (err) {
//     return console.error(err.message);
//   }
//   console.log('Connected to the in-memory SQLite database.');

//   db.serialize(() => {
//     db.run("CREATE TABLE employees (employee_id INT, first_name TEXT, last_name TEXT, department_id INT, salary REAL)");
//     db.run("INSERT INTO employees (employee_id, first_name, last_name, department_id, salary) VALUES (1, 'John', 'Doe', 1, 60000)");
//     db.run("INSERT INTO employees (employee_id, first_name, last_name, department_id, salary) VALUES (2, 'Jane', 'Smith', 1, 80000)");
//     db.run("INSERT INTO employees (employee_id, first_name, last_name, department_id, salary) VALUES (3, 'Bob', 'Johnson', 1, 50000)");
//     db.run("INSERT INTO employees (employee_id, first_name, last_name, department_id, salary) VALUES (4, 'Alice', 'Davis', 2, 75000)");
//     db.run("INSERT INTO employees (employee_id, first_name, last_name, department_id, salary) VALUES (5, 'Charlie', 'Brown', 2, 55000)");
//     db.run("INSERT INTO employees (employee_id, first_name, last_name, department_id, salary) VALUES (6, 'Eve', 'Wilson', 2, 70000)");
//   });
// });