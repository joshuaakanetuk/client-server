require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV, CLIENT_ORIGIN } = require("./config");

// ROUTES
const authRouter = require('./auth/auth-router');
const usersRouter = require("./users/users-router");
const projectsRouter = require("./projects/projects-router");
const notesRouter = require("./notes/notes-router");

const app = express();

const morganOption = NODE_ENV === "production" ? "tiny" : "common";

//https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FVJ5VEFG3BxeW7vS4fEvQjq%2FAgency%3Fnode-id%3D0%253A1&chrome=DOCUMENTATION

app.use(morgan(morganOption));
const corsOptions = {
  "origin": CLIENT_ORIGIN,
  "methods": "GET, HEAD, PUT, PATCH, POST, DELETE",
  // other options
}

app.use(cors(corsOptions));
app.use(helmet());

app.use("/api/auth", authRouter)
app.use("/api/users", usersRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/notes", notesRouter);

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;
