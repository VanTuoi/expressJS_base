// config/db.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/express_db");
    console.log("Connected to the database successfully at", process.env.MONGO_URI);
  } catch (err) {
    console.error("Error connecting to the database:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
