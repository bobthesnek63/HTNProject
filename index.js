const http = require('http');
const express = require('express');
const app = express();
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

app.engine('html', ejs.renderFile);
// app.use(express.static('/server'));

const PORT = process.env.PORT || 5050;
const server = http.createServer(app).listen(PORT)

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/server/index.html');
});

app.post('/requests', (req, res) => {
  res.sendFile(__dirname + '/server/vform.html');
});

