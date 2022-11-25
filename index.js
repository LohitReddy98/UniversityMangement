'use strict';

const express = require('express');
const app = express();
app.enable('trust proxy');

// Automatically parse request body as form data.
app.use(express.urlencoded({ extended: false }));
// This middleware is available in Express v4.16.0 onwards
app.use(express.json());

// Set Content-Type for all responses for these routes.
app.use((req, res, next) => {
  res.set('Content-Type', 'text/html');
  next();
});

// Create a Winston logger that streams to Stackdriver Logging.
const winston = require('winston');
const { LoggingWinston } = require('@google-cloud/logging-winston');
const loggingWinston = new LoggingWinston();
let getPool = require('./pool.js');
let pool;
const logger = winston.createLogger({
  level: 'info',
  transports: [new winston.transports.Console(), loggingWinston],
});
app.use(async (req, res, next) => {
  try {
    pool = await getPool();
    next();
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});
const userRouter = require("./routes/student")
app.use("/student", userRouter)
const hrRouter = require("./routes/hr")
app.use("/hr", hrRouter)
const companyRouter = require("./routes/company")
app.use("/company", companyRouter)
const adminRouter = require("./routes/admin")
app.use("/admin", adminRouter)
const jobRouter = require("./routes/job")
app.use("/job", jobRouter)
const jobAppRouter = require("./routes/jobApp")
app.use("/jobApp", jobAppRouter)

/**
 * Responds to GET and POST requests for TABS vs SPACES sample app.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */


module.exports = app;
