/**
 * Create Account request responses
 * @author Thomas vanBommel
 * @since 11-2020
 */
const Template = require("./Template.js");

/**
 * Create a new Create Account response object
 * @constructor
 * @param {Object} account - Account used for user authentication (Account.js)
 * @param {Object} database - Database helper used to communicate with the
 *                            database, (Database.js)
 */
function Create(account, database){
  // create / initialize html template
  template = new Template(account, database);

  /**
   * Respond to GET requests to the create account page
   * @param {Object} req - Express "req" request object
   * @param {Object} res - Express "res" response object
   * @param {Object} next - Express "next" next location object
   */
  this.GET = (req, res, next) => {
    // count request and authenticate user
    template.init(req);

    console.log("create!", req.user);

    // check if the user is authencated, if they are redirect them to the dashboard
    if(req.user) return res.redirect("/dashboard");

    // render the login template view
    template.renderTemplate("website/login.html", { title: "Create Account" }, req, res);
  };

  /**
   * Respond to POST requests to the create account page
   * @param {Object} req - Express "req" request object
   * @param {Object} res - Express "res" response object
   * @param {Object} next - Express "next" next location object
   */
  this.POST = (req, res, next) => {
    // count request and authenticate user
    template.init(req);

    // attempt to insert the user into the database
    account.createUser(req.body.username, req.body.password, res, created => {
      // TODO: Render with POST body information
      if(!created) return res.redirect("/create");

      // request a new cookie session for the provided user
      account.login(req, res, loggedin => {
        // TODO: Render with POST body information
        if(!loggedin) return res.redirect("/create");

        // if successful redirect to the dashboard
        res.redirect("/dashboard");
      });
    });
  };
}

// export Create object
module.exports = Create;
