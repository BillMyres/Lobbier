/**
 * Database helper for Lobbier application
 * @author Thomas vanBommel
 * @since 11-19-2020
 */
const { Pool } = require("pg");

/**
 * Request query data from the database
 * @callback data_callback
 * @param {Object} data - Data requested from the database
 */

/**
 * Successful query
 * @callback success_callback
 */

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
   * Query the database
   * @param {string} query - PSQL Query string
   * @param {Object} res - Experss "res" Response Object
   * @param {data_callback} data_callback - Request callback
   */
  this.query = (query, res, data_callback) => {
    this.pool.connect((err, client, release) => {
      if(err) {
        release();
        return returnError(res, err);
      }

      client.query(query, (err, data) => {
        release();
        if(err) return returnError(res, err);

        data_callback(data);
      });
  }); };

  /**
  * Request users data from the database
  * @param {string} username - Users unique username
  * @param {Object} res - Experss "res" Response Object
  * @param {data_callback} query - Request callback
  */
  this.findUser = (username, res, data_callback) => {
    this.query(
      `SELECT * FROM users WHERE username = '${username}'`, res, data => {
        console.log("findUser rows:" + data.rows);
      if(data.rows.length !== 1) return returnError(res, null);

      data_callback(data);
  }); };

  /**
   * Select all the lobbies and their columns
   * @param {Object} res - Experss "res" Response Object
   * @param {data_callback} data_callback - Request callback
   */
  this.selectLobbies = (res, data_callback) => {
    this.query(`SELECT * FROM lobbies`, res, data_callback);
  };

  /**
   * Select user id's, name's, and position for a specified lobby
   * @param {Integer} lobby_id - ID of the lobbys attendance to modify
   * @param {Object} res - Experss "res" Response Object
   * @param {data_callback} data_callback - Request callback
   */
  this.selectLobbyUsers = (lobby_id, res, data_callback) => {
    this.query(
      `SELECT id, username, position_x, position_y FROM users ` +
      `WHERE id IN (` +
        `SELECT player FROM attendance ` +
        `WHERE lobby = '${lobby_id}'` +
      `)`, res, data_callback);
  };

  /**
   * Insert a new user into the database
   * @param {string} username - Username of the user to insert
   * @param {string} password - Password of the user to insert
   * @param {Object} res - Experss "res" Response Object
   * @param {success_callback} success_callback - Called on success
   */
  this.insertUser = (username, password, res, success_callback) => {
    this.query(
      `INSERT INTO users (username, password) ` +
      `VALUES ('${username}', '${password}')`, res, data => {
        success_callback();
  }); };

  /**
   * Insert a new lobby with an owner
   * @param {string} username - Username of the user to insert
   * @param {string} title - Lobby title / name
   * @param {Object} res - Experss "res" Response Object
   * @param {success_callback} success_callback - Called on success
   */
  this.insertLobby = (username, title, res, success_callback) => {
    this.query(
      `INSERT INTO lobbies (owner, name) ` +
      `VALUES ('${username}', '${title}')`, res, data => {
        success_callback();
  }); };

  /**
   * Insert a message from a user to a specified lobby
   * @param {string} username - Username of the user to insert
   * @param {Integer} lobby_id - ID of the lobbys attendance to modify
   * @param {string} message - Message to send / insert
   * @param {Object} res - Experss "res" Response Object
   * @param {success_callback} success_callback - Called on success
   */
  this.insertMessage = (username, lobby_id, message, res, success_callback) => {
    this.query(`
      INSERT INTO messages (owner, lobby, message, date)
      VALUES (
        '${username}', '${lobby_id}', '${message}', '${getDate()}'
      )`, res, data => {
        success_callback();
  }); };

  /**
   * Add a user to the attendance table with the lobby provided
   * @param {string} username - Users username
   * @param {Integer} lobby_id - ID of the lobbys attendance to modify
   * @param {Object} res - Experss "res" Response Object
   * @param {success_callback} success_callback - Called on success
   */
  this.addUserToLobbyAttendance =(username, lobby_id, res, success_callback) =>{
    this.query(`
      WITH u AS (
        SELECT id FROM users
        WHERE username = '${username}'
      ) INSERT INTO attendance (lobby, player)
        VALUES ('${lobby_id}', (SELECT id FROM u))
        ON CONFLICT DO NOTHING
      `, res, data => {
        success_callback();
  }); };

  /**
   * Remove user from all lobbies attendance
   * @param {string} username - Users username
   * @param {Object} res - Experss "res" Response Object
   * @param {success_callback} success_callback - Called on success
   */
  this.removeUserFromAttendance = (username, res, success_callback) => {
    this.query(`
      DELETE FROM attendance WHERE player = (
        SELECT id FROM users WHERE username = '${username}'
      )`, res, data => {
        success_callback();
  }); };

  /**
   * Update the users x, y position in the database
   * @param {string} username - Username of the user to insert
   * @param {Double} pos_x - Positon on the x axis
   * @param {Double} pos_y - Positon on the y axis
   * @param {Object} res - Experss "res" Response Object
   * @param {success_callback} success_callback - Called on success
   */
  this.updateUserPosition = (username, pos_x, pos_y, res, success_callback) => {
    this.query(
      `UPDATE users SET position_x = '${pos_x}', position_y = '${pos_y}' ` +
      `WHERE username = '${username}'`, res, data => {
        success_callback();
  }); };

  /**
   * Get all the messages for a specified lobby
   * @param {Integer} lobby_id - ID of the lobby to access
   * @param {Object} res - Experss "res" Response Object
   * @param {data_callback} data_callback - callback for the query data
   */
  this.getLobbyMessages = (lobby_id, res, data_callback) => {
    this.query(`SELECT * FROM messages WHERE lobby = '${lobby_id}'`, res,
      data => {
        data_callback(data.rows);
  }); };
}

/**
 * Return an error back to the user and log it to the terminal
 * @param {Object} res - Experss "res" Response Object
 * @param {Object} err - Express "err" Error object
 */
function returnError(res, err){
  if(res) res.send("Database Error");
  console.error(err);
}

function getDate(){
  let date = new Date();
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ` +
         `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}

/** Export Database */
module.exports = Database;
