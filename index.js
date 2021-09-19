const http = require('http');
const express = require('express');
const app = express();
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const parse = require("pg-connection-string").parse;
const { Pool } = require("pg");
const prompt = require("prompt");
const Sequelize = require("sequelize-cockroachdb");

// Connect to CockroachDB through Sequelize.
var sequelize = new Sequelize({
  dialect: "postgres",
  username: "bobthesnek63",
  password: "HacktheNorthTest",
  host: "free-tier.gcp-us-central1.cockroachlabs.cloud",
  port: 26257,
  database: "witty-jackal-3642.defaultdb",
  dialectOptions: {
    ssl: {
      rejectUnauthorized: false,
      // For secure connection:
      /*ca: fs.readFileSync('certs/ca.crt')
                .toString()*/
    },
  },
  logging: false,
});

  // Define the Account model for the "accounts" table.
const Account = sequelize.define("accounts", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
  },
  balance: {
    type: Sequelize.INTEGER,
  },
});

app.engine('html', ejs.renderFile);
// app.use(express.static('/server'));
var urlencodedparser = bodyParser.urlencoded({extended:false});

const PORT = process.env.PORT || 5050;
const server = http.createServer(app).listen(PORT)

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/server/index.html');
});

app.get('/browseRequests', (req, res) => {
  res.sendFile(__dirname + '/server/browseRequests.html');
});

app.post('/postRequest', (req, res) => {
  res.sendFile(__dirname + '/server/postRequest.html');
});

app.post('/data', urlencodedparser, (req, res) => {
  // Create the "accounts" table.
  Account.sync({
    force: false,
  })
  .then(function (){
    Account.bulkCreate([
      {id: req.body.id,
      balance: req.body.balance}
    ])
  })
    .then(function () {
      // Retrieve accounts.
      return Account.findAll();
    })
    .then(function (accounts) {
      // Print out the balances.
      accounts.forEach(function (account) {
        console.log(account.id + " " + account.balance);
      });
    })
    .catch(function (err) {
      console.error("error: " + err.message);
      process.exit(1);
    });

  res.redirect('/');
});
