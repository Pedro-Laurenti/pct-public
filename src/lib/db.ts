import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.server,
  user: process.env.usr,
  password: process.env.pwd,
  database: process.env.bd,
});

export default pool;