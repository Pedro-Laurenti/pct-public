import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.server,
  user: process.env.usr,
  password: process.env.pwd,
  database: process.env.bd,
});

export default pool;
