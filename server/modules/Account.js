/**
 * @author Thomas vanBommel
 * @since 11-19-2020
 */

const LocalStrategy = require('passport-local').Strategy;
const session = require("cookie-session");
const passport = require("passport");
const bcrypt = require("bcrypt");


function Account(database){
  this.session = session;
  this.passport = passport;

  this.passport.serializeUser((user, done) => { done(null, user.username); });
  this.passport.deserializeUser((username, done) => {
    database.findUser(username, done);
  });

  this.passport.use(new LocalStrategy((username, password, done) => {
    database.findUser(username, (err, data) => {
      if(err) return done(err);

      if(data.rows <= 0) return done(null, false, { message: "Incorrect username" });
      if(data.rows > 1) return done(null, false, { message: "Too many results" });

      let user = data.rows[0];

      bcrypt.compare(password, user.password, (err, passed) => {
        if(err) return done(null, false, { message: "Validation error" + err.stack });
        if(!passed) return done(null, false, { message: "Incorrect password"});

        console.log("Validated user", user);
        return done(null, user);
      });
    });
  }));

  this.login = (req, res, success_callback) => {
    passport.authenticate("local", (err, user, info) => {
      if(err) return success_callback(err, false);
      if(!user) return success_callback("Incorrect login credentials", false);

      req.login(user, err => {
        success_callback(err, true);
      });
    })(req, res);
  };

  this.isAuthencated = req => {
    if(req.session.passport){
      let user = req.session.passport.user;

      if(user && typeof user !== "undefined") return user;
      return false;
    }
  };

  this.createUser = (username, password, success_callback) => {
    bcrypt.hash(password, 13, (err, hash) => {
      if(err) return success_callback(err, false);

      database.query(`INSERT INTO users (username, password) ` +
          `VALUES ('${username}', '${hash}')`, (err, data) => {

        if(err) return success_callback(err, false);
        return success_callback(err, true);
      });
    });
  };
}

module.exports = Account;
