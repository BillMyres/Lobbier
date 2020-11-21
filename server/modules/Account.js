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
 * Create a new Account helper
 * @constructor
 * @param {Database} database - Database object from Database.js file
 */
function Account(database){
  // have session and passport available for express to "use"
  this.session = session;
  this.passport = passport;

  // give passport the ability to serialize our custom user model
  this.passport.serializeUser((user, done) => { done(null, user.username); });
  this.passport.deserializeUser((username, done) => {
    database.findUser(username, done);
  });

  // tell passport how to validate our users
  this.passport.use(new LocalStrategy((username, password, done) => {
    // seach the database for the user
    database.findUser(username, (err, data) => {
      // if an error has occured call the callback function and return
      if(err){
        console.log("Error finding user: ", username, err.stack);
        return done(err);
      }

      // ensure there is at least 1 result
      if(data.rows.length <= 0) return done(null, false, {
        message: "Incorrect username"
      });

      // check if there is more than 1 result
      if(data.rows.length > 1) {
        // log error to the terminal
        console.log(`User query returned ${data.rows.length} results for user`, username);
        // return error to the callback function
        return done(null, false, { message: "Too many results" });
      }

      // set user == to the first row back from the database
      let user = data.rows[0];
      // compare stored password with provided password
      bcrypt.compare(password, user.password, (err, passed) => {
        if(err) {
          // log error to the terminal
          console.log("Authentication comp error for user:", username);
          // return the error message to the callback
          return done(null, false, { message: "Validation error" + err.stack });
        }

        // if the user didn't pass the authentication text return the error
        if(!passed) {
          // log error to the terminal
          console.log("Failed authentication:", username);
          // return the error to the callback
          return done(null, false, { message: "Incorrect password"});
        }

        // log progress to the terminal
        console.log("Validated user", user);
        // return user to the callback function
        return done(null, user);
      });
    });
  }));

  /**
   * Request an operation with a something / false response
   * @callback success_callback
   * @param {Object} err - Error object holding error messages that occured
   * @param {Object} success - false if not successful an object otherwise
   */
  /**
   * Login / authenticate user
   * @param {Object} req - Express "req" request object
   * @param {Object} res - Express "res" response object
   * @param {success_callback} success_callback - Operation success callback
   *    returns the username as a string for the success "object"
   */
  this.login = (req, res, success_callback) => {
    // cookie authentication
    passport.authenticate("local", (err, user, info) => {
      if(err){
        // log progress to terminal
        console.log("Authentication error for user:", user);
        // send error to success_callback
        return success_callback(err, false);
      }

      if(!user){
        // log progress to terminal
        console.log("Invalid authentication credentials for user:", user);
        // send error to success_callback
        return success_callback("Incorrect login credentials", false);
      }

      // "login" with the passport cookie session
      req.login(user, err => {
      // send error and success to success_callback
        success_callback(err, true);
      });
    })(req, res);
  };

  /**
   * Check if a user is authenticated
   * @param {Object} req - Express "req" request object
   */
  this.isAuthencated = req => {
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
   * @param {success_callback} success_callback - Operation success callback
   */
  this.createUser = (username, password, success_callback) => {
    // hash password
    bcrypt.hash(password, 13, (err, hash) => {
      // return error is any occured
      if(err) return success_callback(err, false);

      // insert user into database query
      database.query(`INSERT INTO users (username, password) ` +
          `VALUES ('${username}', '${hash}')`, (err, data) => {
        // if an error occured send it to the callback
        if(err) return success_callback(err, false);
        // success! return true
        return success_callback(err, true);
      });
    });
  };

  // log progress to the terminal
  console.log("Account.js initialized");
}

/** Export Account */
module.exports = Account;
