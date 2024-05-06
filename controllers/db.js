const dotenv = require('dotenv');
dotenv.config();

const mysql = require('mysql');

const conn = mysql.createConnection({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
});

module.exports = conn;