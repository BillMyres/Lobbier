/**
 * Lobby request responses
 * @author Thomas vanBommel
 * @since 11-2020
 */
const Template = require("./Template.js");

/**
 * Create a new Lobby response object
 * @constructor
 * @param {Object} account - Account used for user authentication (Account.js)
 * @param {Object} database - Database helper used to communicate with the
 *                            database, (Database.js)
 */
function Lobby(account, database){
  // create / initialize html template
  template = new Template(account, database);

  /**
   * Respond to GET requests to the lobby pages
   * @param {Object} req - Express "req" request object
   * @param {Object} res - Express "res" response object
   * @param {Object} next - Express "next" next location object
   */
  this.GET = (req, res, next) => {
    // count request and authenticate user
    template.init(req);

    // if the user isn't logged in, redirect them to the home page
    if(!req.user) return res.redirect("/");

    // get the lobby id from the requested url
    let lobby_id = getLobbyNumberFromURL(req.url);

    console.log("Lobby id:", lobby_id);

    // add player to the lobby and render the template with the provided context
    database.addUserToLobbyAttendance(req.user, lobby_id, res, () => {
      database.getLobbyMessages(lobby_id, res, messages => {
        template.renderTemplate("website/lobby.html", {
          messages: messages,
          lobby_id: lobby_id
        }, req, res);
      });
    });
  };

  /**
   * Respond to POST requests to the lobby pages
   * @param {Object} req - Express "req" request object
   * @param {Object} res - Express "res" response object
   * @param {Object} next - Express "next" next location object
   */
  this.POST = (req, res, next) => {
    // count request and authenticate user
    template.init(req);

    // if the user is not authencated, redirect to the home page
    if(!req.user) return res.redirect("/");

    // get the lobby id from the requested url
    let lobby_id = getLobbyNumberFromURL(req.url);
    let message = encodeURIComponent(req.body.message.replace(/'/g, "`"));

    database.insertMessage(req.user, lobby_id, message, res, () => {
      res.status(200).end("sent");
    });
  }
};

/**
 * Get the lobby number / id from the request URL
 * @param {string} url - Express "req" request URL
 */
function getLobbyNumberFromURL(url){
  return url.substr(7).replace(/[^0-9]/g, "");
}

function getDate(){
  let date = new Date();
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ` +
         `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}

module.exports = Lobby;
