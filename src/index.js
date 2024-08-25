import express from "express";
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
import cookieParser from "cookie-parser";
const initRoutes = require("./router/index");

const connectDB = require("./connectDBMongo");

// Init
const app = express();
const PORT = process.env.PORT || 8080;

// Kết nối đến MongoDB
connectDB();

// Log
const logStream = fs.createWriteStream(path.join(__dirname, "log.txt"), { flags: "a" });
app.use(morgan("combined", { stream: logStream }));

// Config middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// Config CORS
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", process.env.URL_FRONT_END);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

// Router
app.use("/api", initRoutes());

// Test connect
app.listen(PORT, (error) => {
  if (!error) console.log("Server is successfully running, and server is listening on port " + PORT);
  else console.log("Error occurred, server can't start", error);
});
