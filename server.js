import express from "express";
import routes from "./routes";
import { APP_PORT, DB_URL } from "./config";
import errorHandler from "./middlewares/errorHandler";
import mongoose from "mongoose";
import path from "path";
const app = express();
const PORT = APP_PORT || 8000;

// Database connection
mongoose.connect(DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected...");
});

// Create a global variable to use this product controller inside to create a path

global.appRoot = path.resolve(__dirname);

// need one more middleware use for multipart data
app.use(express.urlencoded({ extended: false }));
// this is a middleware for getting the data form client side recive the data on backend
app.use(express.json());

app.use("/api", routes);

// for uploads folder show image in the browser

app.use("/uploads", express.static("uploads"));

// error handaler middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Listening on port http://localhost:${PORT}`);
});
