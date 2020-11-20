
const Database = require("./modules/Database.js");
const Account = require("./modules/Account.js");
const Error = msg => { throw msg; };
const express = require("express");
const https = require("https");
const path = require("path");
const ejs = require("ejs");
const fs = require("fs");

const options = {
  key: fs.readFileSync(path.join(__dirname + "/key.pem")), //process.env.SERVER_KEY || Error("Missing SERVER_KEY")
  cert: fs.readFileSync(path.join(__dirname + "/cert.pem")),
  passphrase: "12345"
};

const database = new Database(1000, 0, 100);
const account = new Account(database);

const app = express();
const server = https.createServer(options, app);
const port = 8000;

const dashboard_endpoint = "/dashboard";

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(account.session({ keys: ['123', '543'], secret: 'shhh', maxAge: 24 * 60 * 60 * 1000 }));
app.use(account.passport.initialize());
app.use(account.passport.session());

app.get("/", (req, res) => {
  if(account.isAuthencated(req)) return res.redirect(dashboard_endpoint);
  return res.sendFile(path.join(__dirname + "/website/home.html"));
});

app.route(dashboard_endpoint)
  .get((req, res, next) => {
    console.log("Dashboard GET request");

    let user = account.isAuthencated(req);

    if(user) {
      let context = { user: user };

      database.query(`SELECT * FROM lobbies`, (err, data) => {
        if(err) {
          res.send("Database query error");
          return console.error("Database query err " + err.stack);
        }

        context.lobbies = data.rows;

        ejs.renderFile("website/dashboard.html", context, {}, (err, str) => {
          if(err) {
            res.send("Template error");
            return console.error("EJS template err " + err.stack);
          }

          return res.send(str);
        });
      });

    }else{
      return res.redirect("/");
    }
  })
  .post((req, res, next) => {
    let user = account.isAuthencated(req);
    let new_lobby_name = req.body.new_lobby;

    if(typeof new_lobby_name !== "undefined"){

      database.query(
        `INSERT INTO lobbies (name, owner) VALUES ('${new_lobby_name}', '${user}')`,
        (err, data) => {
          if(err){
            res.send("Database query error");
            return console.error("Database query err " + err.stack);
          }

          console.log("data", data);

          res.status(200).end("refresh");
        }
      );
    }else{
      res.status(200).end("Message received!");
    }

  });

app.route("/lobby/*")
  .get((req, res, next) => {
    let lobby = parseInt(req.url.substr(7));
    let user = account.isAuthencated(req);
    if(!user) return res.redirect("/");

    let context = {
      user: user,
      title: lobby
    };

    database.query(`SELECT * FROM messages WHERE lobby = ${lobby}`, (err, data) => {
      if(err){
        res.send("Database query error");
        return console.error("Database query err " + err.stack);
      }

      context.messages = data.rows;

      ejs.renderFile("website/lobby.html", context, {}, (err, str) => {
        if(err) {
          res.send("Template error");
          return console.error("EJS template err " + err.stack);
        }

        return res.send(str);
      });
    });
  })
  .post((req, res, next) => {
    let user = account.isAuthencated(req);
    if(!user) return res.redirect("/");

    let lobby = req.url.substr(7);

    database.query(`INSERT INTO messages (lobby, owner, message, date) ` +
        `VALUES ('${lobby}', '${user}', '${req.body.message}', '${new Date()}')`, (err, data) => {
        if(err){
          res.status(200).end("Error");
          return console.error("Database query err " + err.stack);
        }

        res.status(200).end("Message sent!");
    });
  });

app.route("/create")
  .get((req, res, next) => {
    if(account.isAuthencated(req)) return res.redirect(dashboard_endpoint);
    ejs.renderFile("website/login.html", { title: "Create Account" }, {}, (err, str) => {
      if(err) return next(err);
      res.send(str);
    });
  })
  .post((req, res, next) => {
    account.createUser(req.body.username, req.body.password, (err, success) => {
      if(err) return res.redirect("/create");

      account.login(req, res, (err, success) => {
        if(err) return next(err);
        if(success) return res.redirect(dashboard_endpoint);

        return res.redirect("/create");
      });
    });
  });

app.route("/login")
  .get((req, res, next) => {
    if(account.isAuthencated(req)) return res.redirect(dashboard_endpoint);
    ejs.renderFile("website/login.html", {}, {}, (err, str) => {
      if(err) return next(err);
      res.send(str);
    });
  })
  .post((req, res, next) => {
    account.login(req, res, (err, success) => {
      if(err) return next(err);
      res.redirect(dashboard_endpoint);
    });
  });

app.get("/logout", (req, res) => {
  if(account.isAuthencated(req)) req.logout();
  res.redirect("/");
});

function readTemplateFile(file){
  return fs.readFileSync(path.join(__dirname + file)).toString();
}

function createTemplate(base, context){
  return ejs.render(base, context);
}

server.listen(port, () => {
  console.log(`Listening https://localhost:${port}`);
});
