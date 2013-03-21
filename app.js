var express = require('express');
var User = require('./User').User;
var UserManager = require('./UserManager').UserManager;

var app = module.exports = express.createServer();
var io = require('socket.io').listen(app);
var port = process.env.PORT || 8000;
app.listen(port);

// Configuration

app.configure(function() {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function() {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function() {
    app.use(express.errorHandler());
});

// socket.io listeners
var userManager = new UserManager(io.sockets);
io.sockets.on('connection', function(socket) {
    userManager.addUser(socket);
    userManager.updateAllUsers(socket);

    socket.on('disconnect', function() {
        userManager.removeUser(socket);
    });
    socket.on('user-message', function(message) {
        userManager.say(socket, message);
    });
    socket.on('user-move', function(data) {
        userManager.userMove(data);
    });
});

console.log("Express server listening on port %d", port);
