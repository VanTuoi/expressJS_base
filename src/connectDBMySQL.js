const mysql = require("mysql2");
require("dotenv").config();

// Tạo kết nối đến cơ sở dữ liệu MySQL
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE_NAME,
  port: process.env.DB_PORT,
});

// Kết nối đến cơ sở dữ liệu
connection.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    process.exit(1);
    return;
  }
  console.log(
    "Connected to the database successfully at",
    process.env.DB_HOST + ":" + process.env.DB_PORT + "/" + process.env.DB_DATABASE_NAME
  );
});

module.exports = connection;
