const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const createTcpPool = require('./connect-tcp.js');
const createUnixSocketPool = require('./connect-unix.js');
const client = new SecretManagerServiceClient();

async function accessSecretVersion(secretName) {
    const [version] = await client.accessSecretVersion({ name: secretName });
    return version.payload.data;
}
let pool;
async function getPool() {
    if (pool)
        pool
    else
        await createPool;
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
module.exports = getPool