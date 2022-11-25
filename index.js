'use strict';

const express = require('express');
const createTcpPool = require('./connect-tcp.js');
const createUnixSocketPool = require('./connect-unix.js');

const app = express();
app.set('view engine', 'pug');
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
let pool;
const logger = winston.createLogger({
  level: 'info',
  transports: [new winston.transports.Console(), loggingWinston],
});

// Retrieve and return a specified secret from Secret Manager
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const client = new SecretManagerServiceClient();

async function accessSecretVersion(secretName) {
  const [version] = await client.accessSecretVersion({ name: secretName });
  return version.payload.data;
}

const createPool = async () => {
  const config = {
    connectionLimit: 5,
    connectTimeout: 10000,
    acquireTimeout: 10000,
    waitForConnections: true,
    queueLimit: 0,
  };

  const { CLOUD_SQL_CREDENTIALS_SECRET } = process.env;
  if (CLOUD_SQL_CREDENTIALS_SECRET) {
    const secrets = await accessSecretVersion(CLOUD_SQL_CREDENTIALS_SECRET);
    try {
      process.env.DB_PASS = secrets.toString();
    } catch (err) {
      err.message = `Unable to parse secret from Secret Manager. Make sure that the secret is JSON formatted: \n ${err.message} `;
      throw err;
    }
  }
  if (process.env.INSTANCE_HOST) {
    return createTcpPool(config);
  } else if (process.env.INSTANCE_UNIX_SOCKET) {
    return createUnixSocketPool(config);
  } else {
    throw 'Set either the `INSTANCE_HOST` or `INSTANCE_UNIX_SOCKET` environment variable.';
  }
};

app.use(async (req, res, next) => {
  if (pool) {
    return next();
  }
  try {
    pool = await createPool();
    next();
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});
router.get("/", async (req, res) => {
  // const pass = req.body.pass
  // const email = req.body.email
  try {
      const x= pool.query('select * from ADMIN_AUTH');
      res.send(x)
  } catch (err) {
      res
          .status(500)
          .send('Unable to load page. Please check the application logs for more details.')
          .end();
  }
})
const userRouter = require("./routes/student")
app.use("/student", userRouter)

/**
 * Responds to GET and POST requests for TABS vs SPACES sample app.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */


module.exports = { app, pool };
