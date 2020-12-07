/**
 * Home request responses
 * @author Thomas vanBommel
 * @since 11-2020
 */
const Template = require("./Template.js");

/**
 * Create a new Home page object to response to page requests
 * @constructor
 * @param {Object} account - Account used for user authentication (Account.js)
 * @param {Object} database - Database helper used to communicate with the
 *                            database, (Database.js)
 */
function Home(account, database){
  // create / initialize html template
  template = new Template(account, database);

  /**
   * Respond to GET requests to the home page
   * @param {Object} req - Express "req" request object
   * @param {Object} res - Express "res" response object
   * @param {Object} next - Express "next" next location object
   */
  this.GET = (req, res, next) => {
    console.log("HOME ");

    // count request and authenticate user
    template.init(req);

    // if the user is logged in, redirect them to the dashboard
    if(req.user) return res.redirect("/dashboard");

    // render the homepage template
    template.renderTemplate("website/home.html", {}, req, res);
  };
}

module.exports = Home;
