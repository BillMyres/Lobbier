/**
 * Dashboard request responses
 * @author Thomas vanBommel
 * @since 11-2020
 */
const Template = require("./Template.js");

/**
 * Create a new Dashboard object to response to page requests
 * @constructor
 * @param {Object} account - Account used for user authentication (Account.js)
 * @param {Object} database - Database helper used to communicate with the
 *                            database, (Database.js)
 */
function Dashboard(account, database){
  // create / initialize html template
  template = new Template(account, database);

  /**
   * Respond to GET requests to the dashboard
   * @param {Object} req - Express "req" request object
   * @param {Object} res - Express "res" response object
   * @param {Object} next - Express "next" next location object
   */
  this.GET = (req, res, next) => {
    // count request and authenticate user
    template.init(req);

    // if the user is not authencated, redirect to the home page
    if(!req.user) return res.redirect("/");

    // remove user from lobby attendance
    database.removeUserFromAttendance(req.user, res, () => {
      // query database for list of lobbies and render website with data
      database.selectLobbies(res, data => {
        template.renderTemplate("website/dashboard.html", {
          lobbies: data.rows
        }, req, res);
      });
    });
  };

  /**
   * Respond to POST requests to the dashboard
   * @param {Object} req - Express "req" request object
   * @param {Object} res - Express "res" response object
   * @param {Object} next - Express "next" next location object
   */
  this.POST = (req, res, next) => {
    // count request and authenticate user
    template.init(req);

    // if the user is not authencated, redirect to the home page
    if(!req.user) return res.redirect("/");

    // get the new lobby name, if there is one
    let lobby_name = req.body.new_lobby;

    // attempt to insert the new lobby into the database
    if(typeof lobby_name !== "undefined"){
      database.insertLobby(req.user, lobby_name, res, () => {
        res.status(200).end("success");
      });
    }
  };
}

// export Dashboard object
module.exports = Dashboard;
