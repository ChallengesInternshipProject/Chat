'use strict';

const express = require('express');
const socketIO = require('socket.io');
const path = require('path');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');

const server = express()
  .use((req, res) => res.sendFile(INDEX) )
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const mongoose = require('mongoose');

var mongodbServer = "mongodb://serverConnection:dareornot!mlab@ds029635.mlab.com:29635/dareornot"
mongoose.connect(mongodbServer);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('Connected to DB');


  });
var UserList = require('./models/UserList');

const io = socketIO(server);

io.on('connection', (socket) => {
  // console.log('Client connected');
  // socket.on('disconnect', () => console.log('Client disconnected'));
  var addedUser = false;
     // console.log(socket.id + ' connected');
     io.emit('clientConnect', {id: socket.id});

     socket.on('private message', function (room) {
         socket.join(room);
         io.sockets.in(room).emit('private message', 'pm from ' + socket.id);
     });

     socket.on('leave room', function (room) {

         socket.leave(room);
         console.log(socket.id + " left " + room)

     });

     socket.on('message', function (msg) {
         console.log(msg);
         io.emit('message',msg);
     });

     socket.on('add user', function (username) {
         if (addedUser) return;
         socket.username = username;
         addedUser = true;

         var newUser = new UserList({
             user: socket.username,
             socketID: socket.id
         });
         newUser.save();
         io.emit('new user', 'has connected');
     });

     socket.on('say to someone', function (id, msg) {
         socket.broadcast.to(id).emit('my message', msg);
     });

     socket.on('clear', function () {
         io.emit('clear', 'the clear response');
         console.log('clearing all messages');
     });
     socket.on('disconnect', function () {
         console.log(socket.username + ' disconnected');
         UserList.find({user: socket.username}).remove().exec();
         io.emit('dc user', {
             user: socket.username,
             id: socket.id
         });
     });

});

setInterval(() => io.emit('time', new Date().toTimeString()), 1000);
