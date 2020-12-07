/**
 * Game request responses
 * @author Thomas vanBommel
 * @since 11-2020
 */
const Template = require("./Template.js");

/**
 * Create a new Game object to response to page requests
 * @constructor
 * @param {Object} account - Account used for user authentication (Account.js)
 * @param {Object} database - Database helper used to communicate with the
 *                            database, (Database.js)
 */
function Game(account, database){
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

    // get the lobby id from the requested url
    let lobby_id = getLobbyNumberFromURL(req.url);

    if(lobby_id !== ""){
      // select users from this lobby and send their information
      database.selectLobbyUsers(lobby_id, res, data => {
        res.send(JSON.stringify(data.rows));
      });
    }
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

    // get the lobby id from the requested url
    let lobby_id = getLobbyNumberFromURL(req.url);

    if(req.user && req.body.action){
      // user actions
      switch(req.body.action){
        case "move":
          database.updateUserPosition(req.user, req.body.x, req.body.y, res, () => {
            return res.status(200).end("updated");
          });
      }
    }
  };
}

/**
 * Get the lobby number / id from the request URL
 * @param {string} url - Express "req" request URL
 */
function getLobbyNumberFromURL(url){
  return url.substr(7).replace(/[^0-9]/g, "");
}

module.exports = Game;
