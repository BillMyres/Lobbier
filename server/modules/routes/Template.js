/**
 * Used to template HTML files
 * @author Thomas vanBommel
 * @since 11-2020
 */
const ejs = require("ejs");
const os = require("os");

let total_requests = 0;
let requests = {};

/**
 * Create a new Template object
 * @constructor
 * @param {Object} account - Account.js object
 * @param {Object} database - Database.js object
 */
function Template(account, database){
  /**
   * Initialize template by counting the request and authenticating the user
   * @param {Object} req - Express "req" request object
   */
  this.init = req => {
    countRequest(req.method);
    countRequest(req.url);

    req.user = account.isAuthenticated(req);
  };

  /**
   * Render an EJS template file
   * @param {string} path - location of the EJS template file
   * @param {Object} context - template context object
   * @param {Object} req - Express "req" request object
   * @param {Object} res - Express "res" response object
   */
  this.renderTemplate = (path, context, req, res) => {
    context.user = req.user;
    context.hostname = os.hostname();

    ejs.renderFile(path, context, {}, (err, str) => {
      if(err) {
        // tell the user an error has occured
        res.send("Template error");
        // write the error to the terminal
        return console.error("EJS template err " + err.stack);
      }

      return res.send(str);
    });
  };
}

/**
 * Count page / endpoint requests
 * @param {string} url - Endpoint to track / add to
 */
function countRequest(url){
  (url in requests) ? requests[url]++ : requests[url] = 1;

  console.log(`#${total_requests++} request`);
  console.log("Endpoing requests:", requests);
};

// export the Template object
module.exports = Template;
