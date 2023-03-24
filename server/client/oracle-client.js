const oracleDb = require("oracledb");
const dotenv = require("dotenv");
dotenv.config();

try {
  oracleDb.initOracleClient({
    libDir: `${process.env.ORACLE_CLIENT_LOCATION}`,
  });
} catch (err) {
  console.log(
    "Error occurred while trying to link to the Oracle Instant Client " +
      err.message
  );
  process.exit(1);
}

module.exports = oracleDb;
