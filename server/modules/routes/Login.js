/**
 * Login request responses
 * @author Thomas vanBommel
 * @since 11-2020
 */
const Template = require("./Template.js");

/**
 * Create a new Login object to response to page requests
 * @constructor
 * @param {Object} account - Account used for user authentication (Account.js)
 * @param {Object} database - Database helper used to communicate with the
 *                            database, (Database.js)
 */
function Login(account, database){
  // create / initialize html template
  template = new Template(account, database);

  /**
   * Respond to GET requests to the login page
   * @param {Object} req - Express "req" request object
   * @param {Object} res - Express "res" response object
   * @param {Object} next - Express "next" next location object
   */
  this.GET = (req, res, next) => {
    // count request and authenticate user
    template.init(req);

    // check if the user is authencated if so, redirect to the dashboard
    if(req.user) return res.redirect("/dashboard");

    // render the login template view
    template.renderTemplate("website/login.html", {}, req, res);
  };

  /**
   * Respond to POST requests to the login page
   * @param {Object} req - Express "req" request object
   * @param {Object} res - Express "res" response object
   * @param {Object} next - Express "next" next location object
   */
  this.POST = (req, res, next) => {
    // count request and authenticate user
    template.init(req);

    // attempt login
    account.login(req, res, loggedin => {
      if(!loggedin) return res.send("Account login error");

      // if successful redirect the user to the dashboard
      res.redirect("/dashboard");
    });
  };
}

// export Login object
module.exports = Login;
