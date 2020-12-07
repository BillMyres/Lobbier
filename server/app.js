/**
 * Server application used to serve the front-end
 * @author Thomas vanBommel
 * @since 11-2020
 */
const Dashboard = require("./modules/routes/Dashboard.js");
const Create = require("./modules/routes/Create.js");
const Logout = require("./modules/routes/Logout.js");
const Login = require("./modules/routes/Login.js");
const Lobby = require("./modules/routes/Lobby.js");
const Home = require("./modules/routes/Home.js");
const Game = require("./modules/routes/Game.js");

const Database = require("./modules/Database.js");
const Account = require("./modules/Account.js");
const Error = msg => { throw msg; };
const express = require("express");
const https = require("https");
const path = require("path");
const fs = require("fs");

// TLS certificate options
const options = {
  key: fs.readFileSync(path.join(__dirname + "/key.pem")),
  cert: fs.readFileSync(path.join(__dirname + "/cert.pem")),
  passphrase: "12345"
};

/** Initialize database and account modules */
const database = new Database(1000, 0, 100);
const account = new Account(database);

let dashboard = new Dashboard(account, database);
let create = new Create(account, database);
let logout = new Logout(account, database);
let login = new Login(account, database);
let lobby = new Lobby(account, database);
let home = new Home(account, database);
let game = new Game(account, database);

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
app.get("/", home.GET);

/** Dashboard requests */
app.route("/dashboard").get(dashboard.GET).post(dashboard.POST);

/** Lobby requests */
app.route("/lobby/*").get(lobby.GET).post(lobby.POST);

/** Lobby requests */
app.route("/game*").get(game.GET).post(game.POST);

/** Create account requests */
app.route("/create").get(create.GET).post(create.POST);

/** Login requests */
app.route("/login").get(login.GET).post(login.POST);

/** Logout requests */
app.get("/logout", logout.GET);

/** Start listening and print start-up message */
server.listen(port, () => {
  // log progress to the terminal
  console.log(`Listening https://localhost:${port}`);
});
