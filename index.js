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

// Serve the index page, showing vote tallies.
app.get('/', async (req, res) => {
  pool = pool || (await createPool());
  try {
    // Get the 5 most recent votes.
    const recentVotesQuery = pool.query(
      'SELECT candidate, time_cast FROM votes ORDER BY time_cast DESC LIMIT 5'
    );

    // Get votes
    const stmt = 'SELECT COUNT(vote_id) as count FROM votes WHERE candidate=?';
    const tabsQuery = pool.query(stmt, ['TABS']);
    const spacesQuery = pool.query(stmt, ['SPACES']);

    // Run queries concurrently, and wait for them to complete
    // This is faster than await-ing each query object as it is created
    const recentVotes = await recentVotesQuery;
    const [tabsVotes] = await tabsQuery;
    const [spacesVotes] = await spacesQuery;

    res.render('index.pug', {
      recentVotes,
      tabCount: tabsVotes.count,
      spaceCount: spacesVotes.count,
    });
  } catch (err) {
    logger.error(err);
    res
      .status(500)
      .send(
        'Unable to load page. Please check the application logs for more details.'
      )
      .end();
  }
});

// Handle incoming vote requests and inserting them into the database.
app.post('*', async (req, res) => {
  const { team } = req.body;
  const timestamp = new Date();

  if (!team || (team !== 'TABS' && team !== 'SPACES')) {
    return res.status(400).send('Invalid team specified.').end();
  }

  pool = pool || (await createPoolAndEnsureSchema());
  // [START cloud_sql_mysql_mysql_connection]
  try {
    const stmt = 'INSERT INTO votes (time_cast, candidate) VALUES (?, ?)';
    // Pool.query automatically checks out, uses, and releases a connection
    // back into the pool, ensuring it is always returned successfully.
    await pool.query(stmt, [timestamp, team]);
  } catch (err) {
    // If something goes wrong, handle the error in this section. This might
    // involve retrying or adjusting parameters depending on the situation.
    // [START_EXCLUDE]
    logger.error(err);
    return res
      .status(500)
      .send(
        'Unable to successfully cast vote! Please check the application logs for more details.'
      )
      .end();
    // [END_EXCLUDE]
  }
  // [END cloud_sql_mysql_mysql_connection]

  res.status(200).send(`Successfully voted for ${team} at ${timestamp}`).end();
});
const userRouter = require("./routes/student")
app.use("/student", userRouter)

/**
 * Responds to GET and POST requests for TABS vs SPACES sample app.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */


module.exports = { app, pool };
