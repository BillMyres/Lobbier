/**
 * @author Thomas vanBommel
 * @since 11-19-2020
 */

const { Pool } = require("pg");

function Database(connectionTimeoutMillis, idleTimeoutMillis, max){
  let options = {};

  options.connectionTimeoutMillis = connectionTimeoutMillis;
  options.idleTimeoutMillis = idleTimeoutMillis;
  options.max = max;

  console.log(options);

  this.pool = new Pool(options);

  this.query = (query, data_callback) => {
    this.pool.connect((err, client, release) => {
      if(err) {
        release();
        data_callback(err);
        return console.error("Database pool connection err " + err.stack);
      }

      client.query(query, (err, data) => {
        release();
        data_callback(err, data);
      });
    });
  };

  this.findUser = (username, data_callback) => {
    this.pool.connect((err, client, release) => {
      if(err) return console.error("Error getting client:", err.stack);

      client.query(
        `SELECT * FROM users WHERE username = '${username}'`,
        (err, data) => {
          release();
          data_callback(err, data);
        }
      );
    });
  }
}

module.exports = Database;
