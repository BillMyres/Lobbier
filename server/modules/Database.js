/**
 * Database helper for Lobbier application
 * @author Thomas vanBommel
 * @since 11-19-2020
 */
const { Pool } = require("pg");

/**
 * Create a new database connection pool
 * @constructor
 * @param {Integer} connectionTimeoutMillis - number of milliseconds to wait
 *    before timing out when connecting a new client
 * @param {Integer} idleTimeoutMillis - number of milliseconds a client must sit
 *    idle in the pool and not be checked out
 * @param {Integer} max - maximum number of clients the pool should contain
 */
function Database(connectionTimeoutMillis, idleTimeoutMillis, max){
  let options = {};

  // Pool options, more info @ https://node-postgres.com/api/pool
  options.connectionTimeoutMillis = connectionTimeoutMillis;
  options.idleTimeoutMillis = idleTimeoutMillis;
  options.max = max;

  // Log options at start-up
  console.log(options);

  // Create new pool
  this.pool = new Pool(options);

  /**
   * Request query data from the database
   * @callback data_callback
   * @param {Object} err - Object is null unless an error has occured
   * @param {Object} data - Data requested from the database
   */
  /**
   * Query the database
   * @param {string} query - PSQL Query string
   * @param {data_callback} query - Request callback
   */
  this.query = (query, data_callback) => {
    // connect to the database
    this.pool.connect((err, client, release) => {
      // if an error has occured
      if(err) {
        // release the pool to free up resources
        release();
        // call the callback funtion with the error object
        data_callback(err);
        // log error to the terminal
        return console.error("Database pool connection err " + err.stack);
      }
      // query the database
      client.query(query, (err, data) => {
        // release the pool to free up resources
        release();
        // call the callback function with the errors and data
        data_callback(err, data);
        // log progress to the terminal
        return console.log("Successful query");
      });
    });
  };

  /**
  * Request users data from the database
  * @param {string} username - Users unique username
  * @param {data_callback} query - Request callback
  */
  this.findUser = (username, data_callback) => {
    // connect to the database
    this.pool.connect((err, client, release) => {
      // if an error has occured log it to the terminal
      if(err) return console.error("Error getting client:", err.stack);
      // query the database for all user columns
      client.query(
        `SELECT * FROM users WHERE username = '${username}'`,
        (err, data) => {
          // release the pool to free up resources
          release();
          // call the callback function with the errors and data
          data_callback(err, data);
          // log progress to the terminal
          return console.log("User query:", username);
        }
      );
    });
  }
}

/** Export Database */
module.exports = Database;
