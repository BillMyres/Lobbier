/**
 * Server application used to serve the front-end
 * @author Thomas vanBommel
 * @since 11-2020
 */
const Database = require("./modules/Database.js");
const Account = require("./modules/Account.js");
const Error = msg => { throw msg; };
const express = require("express");
const https = require("https");
const path = require("path");
const ejs = require("ejs");
const fs = require("fs");

/**
 * TLS certificate options
 * TODO: get from process.env or generate with openssl
 */
const options = {
  key: fs.readFileSync(path.join(__dirname + "/key.pem")),
  cert: fs.readFileSync(path.join(__dirname + "/cert.pem")),
  passphrase: "12345"
};

/** Initialize database and account modules */
const database = new Database(1000, 0, 100);
const account = new Account(database);

/** Create https express application */
const app = express();
const server = https.createServer(options, app);
const port = 8000;

// TODO: remove
const dashboard_endpoint = "/dashboard";

/** Express middle ware */
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(account.session({ keys: ['123', '543'], secret: 'shhh', maxAge: 24 * 60 * 60 * 1000 }));
app.use(account.passport.initialize());
app.use(account.passport.session());

/** Home page requests */
app.get("/", (req, res) => {
  countRequest();
  if(account.isAuthencated(req)) return res.redirect(dashboard_endpoint);
  return res.sendFile(path.join(__dirname + "/website/home.html"));
});

/** Dashboard requests */
app.route(dashboard_endpoint)
  /** Dashboard GET requests */
  .get((req, res, next) => {
    // count this request
    countRequest();
    // log progress
    console.log("Dashboard GET request");

    // check if user is authencated already
    let user = account.isAuthencated(req);

    // if the user is authencated
    if(user) {
      // context for view template
      let context = { user: user };

      // query database for list of available lobbies
      database.query(`SELECT * FROM lobbies`, (err, data) => {
        if(err) {
          // tell the user there has been an error
          res.send("Database query error");
          // write the error to the terminal
          return console.error("Database query err " + err.stack);
        }

        // set lobby context for view template
        context.lobbies = data.rows;

        // render view template with context for the dashboard
        ejs.renderFile("website/dashboard.html", context, {}, (err, str) => {
          if(err) {
            // tell the user an error has occured
            res.send("Template error");
            // write the error to the terminal
            return console.error("EJS template err " + err.stack);
          }

          // send template result to user for the dashboard
          return res.send(str);
        });
      });
    // the user is not authencated
    }else{
      // redirect to the home page
      return res.redirect("/");
    }
  })
  /** Dashboard POST requests */
  .post((req, res, next) => {
    // count this request
    countRequest();
    // check if the user is authencated
    let user = account.isAuthencated(req);
    // get the requested lobby name (if any)
    let new_lobby_name = req.body.new_lobby;

    // check if lobby name exists
    if(typeof new_lobby_name !== "undefined"){
      // query database to insert a new lobby with the provided name
      database.query(
        `INSERT INTO lobbies (name, owner) VALUES ('${new_lobby_name}', '${user}')`,
        (err, data) => {
          if(err){
            // tell the user there has been an error
            res.send("Database query error");
            // write the error to the terminal
            return console.error("Database query err " + err.stack);
          }

          // respond by telling the client to refresh
          res.status(200).end("refresh");
        }
      );
    // lobby name is not defined
    }else{
      // inform the client the message was received
      res.status(200).end("Message received!");
    }
  });

/** Lobby requests */
app.route("/lobby/*")
  /** Lobby GET requests */
  .get((req, res, next) => {
    // count this request
    countRequest();
    // get the lobby id from the request url
    let lobby = req.url.substr(7).replace(/[^0-9]/g, "");
    // check if the user is authencated
    let user = account.isAuthencated(req);
    // if the user is not authencated redirect to the home page
    if(!user) return res.redirect("/");
    // template view context
    let context = {
      user: user,
      title: lobby
    };

    // query database selecting all messages from this lobby
    database.query(`SELECT * FROM messages WHERE lobby = ${lobby}`, (err, data) => {
      if(err){
        // inform user an error has occured
        res.send("Database query error");
        // write error to the terminal
        return console.error("Database query err " + err.stack);
      }

      // add query results to the template context
      context.messages = data.rows;

      // render the template with the provided context
      ejs.renderFile("website/lobby.html", context, {}, (err, str) => {
        if(err) {
          // inform the user an error has occured
          res.send("Template error");
          // write the error to the terminal
          return console.error("EJS template err " + err.stack);
        }

        // send user the template result for the requested lobby
        return res.send(str);
      });
    });
  })
  /** Lobby POST requests */
  .post((req, res, next) => {
    // count this request
    countRequest();
    // check if the user is authencated
    let user = account.isAuthencated(req);
    // if the user is not authencated, redirect to the home page
    if(!user) return res.redirect("/");
    // get the lobby id from the request url
    let lobby = req.url.substr(7).replace(/[^0-9]/g, "");

    // query the database to insert the message sent
    database.query(`INSERT INTO messages (lobby, owner, message, date) ` +
        `VALUES ('${lobby}', '${user}', '${req.body.message}', '${new Date()}')`, (err, data) => {
        if(err){
          // tell the user an error has occured
          res.status(200).end("Error");
          // write the error to the terminal
          return console.error("Database query err " + err.stack);
        }

        // inform the user the request was successful
        res.status(200).end("Message sent!");
    });
  });

/** Create account requests */
app.route("/create")
  /** Create account GET requests */
  .get((req, res, next) => {
    // count this request
    countRequest();

    // check if the user is authencated, if they are redirect them to the dashboard
    if(account.isAuthencated(req)) return res.redirect(dashboard_endpoint);

    // render the login template view
    ejs.renderFile("website/login.html", { title: "Create Account" }, {}, (err, str) => {
      if(err) {
        // inform the user an error has occured
        res.send("Template error");
        // write the error to the terminal
        return console.error("EJS template err " + err.stack);
      }

      // send the response back to the user
      res.send(str);
    });
  })
  /** Create account POST requests */
  .post((req, res, next) => {
    // count this request
    countRequest();
    // attempt to create / add the user to the database
    account.createUser(req.body.username, req.body.password, (err, success) => {
      if(err){
        // if an error, redirect the user back to the create page
        res.redirect("/create");
        // write the error to the terminal
        return console.error("Error creating user:", err.stack);
      }

      // request a new cookie session for the provided user
      account.login(req, res, (err, success) => {
        if(err){
          // tell the user an error has occured
          res.send("Account login error");
          // write the error to the terminal
          return console.error("Account login error:", err.stack);
        }

        // if successful redirect to the dashboard
        if(success) return res.redirect(dashboard_endpoint);
        // redirect to the create page if not successful
        return res.redirect("/create");
      });
    });
  });

/** Login requests */
app.route("/login")
  /** Login GET requests */
  .get((req, res, next) => {
    // count this request
    countRequest();

    // check if the user is authencated if so, redirect to the dashboard
    if(account.isAuthencated(req)) return res.redirect(dashboard_endpoint);

    // render the login template view
    ejs.renderFile("website/login.html", {}, {}, (err, str) => {
      if(err){
        // tell the user an error has occured
        res.send("Template render error");
        // write the error to the terminal
        return console.error("Template render error:", err.stack);
      }

      // return the rendered template for the login page
      res.send(str);
    });
  })
  /** Login POST requests */
  .post((req, res, next) => {
    // count this request
    countRequest();

    // attempt login
    account.login(req, res, (err, success) => {
      if(err){
        // tell the user an error has occured
        res.send("Account login error");
        // write the error to the terminal
        return console.error("Account login error:", err.stack);
      }

      // if successful redirect the user to the dashboard
      res.redirect(dashboard_endpoint);
    });
  });

/** Logout requests */
app.get("/logout", (req, res) => {
  // count this request
  countRequest();
  // check if the user is authencated, if so log them out (delete their cookie)
  if(account.isAuthencated(req)) req.logout();
  // redirect to the home page
  res.redirect("/");
});

let total_requests = 0;
let requests = {};
/**
 * Request counter
 * @param {string} url - Express "req" request url parameter
 */
function countRequest(url){
  // add to the total count
  console.log(`#${total_requests++} request`);

  // if requests object has url as a key
  if(url in requests){
    // increase the count by 1
    requests[url]++;
  }else{
    // otherwise set it to 1
    requests[url] = 1;
  }

  // log all endpoints to the terminal
  console.log("Endpoing requests:", requests);
}

/** Start listening and print start-up message */
server.listen(port, () => {
  // log progress to the terminal
  console.log(`Listening https://localhost:${port}`);
});
