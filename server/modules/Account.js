/**
 * Account authentication helper class for Lobbier
 * @author Thomas vanBommel
 * @since 11-19-2020
 */
const LocalStrategy = require('passport-local').Strategy;
const session = require("cookie-session");
const passport = require("passport");
const bcrypt = require("bcrypt");

/**
 * True or false callback
 * @callback bool_callback
 * @param {bool} data - function result
 */

/**
 * Create a new Account helper
 * @constructor
 * @param {Database} database - Database object from Database.js file
 */
function Account(database){
  // have session and passport available for express to "use"
  this.session = session;
  this.passport = passport;

  /**
   * Login / authenticate user
   * @param {Object} req - Express "req" request object
   * @param {Object} res - Express "res" response object
   * @param {bool_callback} bool_callback - Successful login
   */
  this.login = (req, res, bool_callback) => {
    // cookie authentication
    passport.authenticate("local", (err, user, info) => {
      if(err || !user){
        console.error("Authentication error:", err);
        return bool_callback(false);
      }

      // "login" with the passport cookie session
      req.login(user, err => {
        if(err) console.error("Login error" + err);
        return bool_callback(!err);
      });
    })(req, res);
  };

  /**
   * Check if a user is authenticated
   * @param {Object} req - Express "req" request object
   * @return {string} username of the authenticated user
   */
  this.isAuthenticated = req => {
    // check if the requests session is valid
    if(req.session.passport){
      // get the user information from the session
      let user = req.session.passport.user;
      // check the user is valid and return it
      if(user && typeof user !== "undefined") return user;
      // user is not valid
      return false;
    }
  };

  /**
   * Create a user and store it into the database
   * @param {string} username - Unique username of the user
   * @param {string} password - Raw password to hash n' store
   * @param {Object} res - Experss "res" Response Object
   * @param {bool_callback} bool_callback - Operation success callback
   */
  this.createUser = (username, password, res, bool_callback) => {
    // hash password
    bcrypt.hash(password, 13, (err, hash) => {
      if(err) return bool_callback(false);

      // inser user into database
      database.insertUser(username, hash, res, () => {
        return bool_callback(true);
      });
    });
  };

  // give passport the ability to serialize our custom user model
  this.passport.serializeUser((user, done) => {
    console.log("serialization", user);
    done(null, user.username);
  });
  this.passport.deserializeUser((username, done) => {
    console.log("deserialization", username);
    database.findUser(username, null, data => {
      done(null, data.rows);
    });
  });

  // tell passport how to validate our users
  this.passport.use(new LocalStrategy((username, password, done) => {
    database.findUser(username, null, data => {
      let error_message = "Authentication error";

      // console.log("localstrategy:", data);
      // console.log("FIND USER");

      if(data.rows.length === 1){
        let user = data.rows[0];

        console.log("passport user", user);

        // compare stored password with provided password
        bcrypt.compare(password, user.password, (err, passed) => {
          // check if user failed authentication
          if(err || !passed){
            console.error(error_message, err, passed);
            return done(null, false, {message: error_message})
          }

          // return the user
          done(null, user);
        });
      }else{
        // return error
        done(null, false, { message: error_message });
      }
  }); }));

  // log progress to the terminal
  console.log("Account.js initialized");
}

/** Export Account */
module.exports = Account;
