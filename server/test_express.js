import express from "express";
import mongoSanitize from "express-mongo-sanitize";

const app = express();

app.use((req, res, next) => {
  req.query = { a: 1 };
  next();
});

app.listen(0);
