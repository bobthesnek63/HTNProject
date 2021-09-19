const http = require('http');
const express = require('express');
const app = express();
const ejs = require('ejs');
const bodyParser = require('body-parser');
const parse = require("pg-connection-string").parse;
const { Pool } = require("pg");
const prompt = require("prompt");
const Sequelize = require("sequelize-cockroachdb");
const mySecret = process.env['cockroachDBPassword']

// Connect to CockroachDB through Sequelize.
var sequelize = new Sequelize({
  dialect: "postgres",
  username: "bobthesnek63",
  password: mySecret,
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
const Tasks = sequelize.define("tasks", {
  title: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  tag: {
    type: Sequelize.STRING,
  },
  description: {
    type: Sequelize.STRING,
  },
  requester: {
    type: Sequelize.STRING,
  },
  hours: {
    type: Sequelize.INTEGER,
  }
});

const LogIns = sequelize.define("logins", {
  username: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  password: {
    type: Sequelize.STRING,
  }
});

app.engine('html', ejs.renderFile);
// app.use(express.static('/server'));
var urlencodedparser = bodyParser.urlencoded({extended:false});

const PORT = process.env.PORT || 5050;
const server = http.createServer(app).listen(PORT)

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/server/signUp.html');
});


app.get('/home', (req, res) => {
  res.sendFile(__dirname + '/server/index.html');
});

app.get('/browseRequests', (req, res) => {
  var tasksArr = [];

  Tasks.sync({
    force: false,
  }).then(function (){
    return Tasks.findAll();
  }).then(function (tasks){
    tasks.forEach(function (task){
      var taskJson = {
        title: task.title,
        tag: task.tag,
        description: task.description,
        requester: task.requester,
        hours: task.hours
      }
      
      tasksArr.push(taskJson);
    })
  }).then(function (){
      console.log(tasksArr[0])
      res.render(__dirname + '/server/browseRequests.html', {tasks: tasksArr});
    })
  
});

app.get('/postRequests', (req, res) => {
  res.sendFile(__dirname + '/server/postRequests.html');
});

app.get('/signIn', (req, res) => {
  res.sendFile(__dirname + '/server/signIn.html')
});

app.post('/signIn', urlencodedparser, async (req, res) => {
  var login = await LogIns.findOne({where: {username: req.body.username}});

  
  if ((login.password.localeCompare(req.body.password)) == 0){
      res.redirect('/home');
    } else {
      console.log(login.password.localeCompare(req.body.password));
      res.redirect('/');
    }
  
});

app.get('/signUp', function(req, res){
  res.sendFile(__dirname + '/server/signUp.html')
});

app.post('/signUp', urlencodedparser, (req, res) => {


  LogIns.sync({
    force: false,
  }).then(function (){
    LogIns.bulkCreate([
      {username: req.body.username,
      password: req.body.password}
    ])
  });

  res.redirect('/signIn');
});



app.post('/data', urlencodedparser, (req, res) => {
  // Create the "tasks" table.
  Tasks.sync({
    force: false,
  })
  .then(function (){
    Tasks.bulkCreate([
      {title: req.body.title,
      tag: req.body.tag,
      description: req.body.desc,
      requester: req.body.requ,
      hours: req.body.hours}
    ])
  })
    .then(function () {
      // Retrieve accounts.
      return Tasks.findAll();
    })
    .then(function (tasks) {
      // Print out the balances.
      tasks.forEach(function (task) {
        console.log(task.title + " " + task.tag + " " + task.description + " " + task.requester + " " + task.hours);
      });
    })
    .catch(function (err) {
      console.error("error: " + err.message);
      process.exit(1);
    });

  res.redirect('/');
});




